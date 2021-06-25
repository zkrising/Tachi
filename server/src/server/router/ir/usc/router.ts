import { Router, RequestHandler } from "express";
import { FindChartOnSHA256 } from "../../../../utils/queries/charts";
import { SYMBOL_TachiAPIAuth, SYMBOL_TachiData } from "../../../../lib/constants/tachi";
import db from "../../../../external/mongo/db";
import {
	ChartDocument,
	PBScoreDocument,
	SuccessfulAPIResponse,
	ImportDocument,
} from "tachi-common";
import { AssertStrAsPositiveNonZeroInt } from "../../../../lib/score-import/framework/common/string-asserts";
import CreateLogCtx, { KtLogger } from "../../../../lib/logger/logger";
import { CreatePOSTScoresResponseBody, TachiScoreToServerScore } from "./usc";
import { ExpressWrappedScoreImportMain } from "../../../../lib/score-import/framework/express-wrapper";
import { GetUserWithID } from "../../../../utils/user";
import { ParseIRUSC } from "../../../../lib/score-import/import-types/ir/usc/parser";
import { USCIR_MAX_LEADERBOARD_N } from "../../../../lib/constants/usc-ir";
import { CreateMulterSingleUploadMiddleware } from "../../../middleware/multer-upload";
import { AssignToReqTachiData } from "../../../../utils/req-tachi-data";
import { CDNStore } from "../../../../lib/cdn/cdn";
import { ONE_MEGABYTE } from "../../../../lib/constants/filesize";
import { RequirePermissions } from "../../../middleware/auth";
import { GetUSCIRReplayURL } from "../../../../lib/cdn/url-format";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

const STATUS_CODES = {
	UNAUTH: 41,
	CHART_REFUSE: 42,
	FORBIDDEN: 43,
	NOT_FOUND: 44,
	SERVER_ERROR: 50,
	SUCCESS: 20,
	BAD_REQ: 40,
};

const ValidateUSCRequest: RequestHandler = async (req, res, next) => {
	const token = req.header("Authorization");

	if (!token) {
		return res.status(200).json({
			statusCode: STATUS_CODES.BAD_REQ,
			description: "No auth token provided.",
		});
	}

	const splitToken = token.split(" ");

	if (splitToken.length !== 2 || splitToken[0] !== "Bearer") {
		return res.status(200).json({
			statusCode: STATUS_CODES.BAD_REQ,
			description: "Invalid Authorization Header. Expected Bearer <token>",
		});
	}

	const uscAuthDoc = await db["api-tokens"].findOne({
		token: splitToken[1],
	});

	if (!uscAuthDoc) {
		return res.status(200).json({
			statusCode: STATUS_CODES.UNAUTH,
			description: "Unauthorized.",
		});
	}

	req[SYMBOL_TachiAPIAuth] = uscAuthDoc;

	return next();
};

router.use(ValidateUSCRequest);
// This is an implementation of the USCIR spec as per https://uscir.readthedocs.io.
// This specification always returns 200 OK, regardless of whether the result was okay
// as the HTTP code is used to determine whether the server received the request properly,
// rather than the result of the request.

/**
 * Used to check your connection to the server, and receive some basic information.
 * https://uscir.readthedocs.io/en/latest/endpoints/heartbeat.html
 * @name GET /ir/usc
 */
router.get("/", (req, res) =>
	res.status(200).json({
		statusCode: STATUS_CODES.SUCCESS,
		description: "IR Request Successful.",
		body: {
			serverTime: Math.floor(Date.now() / 1000),
			serverName: "Bokutachi",
			irVersion: "0.3.1-a",
		},
	})
);

const RetrieveChart: RequestHandler = async (req, res, next) => {
	const chart = await FindChartOnSHA256("usc", req.params.chartHash);

	AssignToReqTachiData(req, {
		uscChartDoc: (chart ?? undefined) as ChartDocument<"usc:Single"> | undefined,
	});

	return next();
};

/**
 * Used to check if the server will accept a score for a given chart in advance of submitting it.
 * https://uscir.readthedocs.io/en/latest/endpoints/chart-charthash.html
 * @name GET /ir/usc/charts/:chartHash
 */
router.get("/charts/:chartHash", RetrieveChart, (req, res) => {
	const chart = req[SYMBOL_TachiData]!.uscChartDoc;

	if (!chart) {
		return res.status(200).json({
			statusCode: STATUS_CODES.CHART_REFUSE,
			description: "This chart is not tracked, and will not be accepted.",
		});
	}

	return res.status(200).json({
		statusCode: STATUS_CODES.SUCCESS,
		description: "This chart is tracked by the IR.",
	});
});

/**
 * Used to retrieve the current server record for the chart with the specified hash.
 * https://uscir.readthedocs.io/en/latest/endpoints/record.html
 * @name GET /ir/usc/charts/:chartHash/record
 */
router.get("/charts/:chartHash/record", RetrieveChart, async (req, res) => {
	const chart = req[SYMBOL_TachiData]!.uscChartDoc;

	// spec ambigious here

	if (!chart) {
		return res.status(200).json({
			statusCode: STATUS_CODES.CHART_REFUSE,
			description: "This IR is not currently tracking this chart.",
		});
	}

	const serverRecord = (await db["personal-bests"].findOne({
		chartID: chart.chartID,
		"rankingData.rank": 1,
	})) as PBScoreDocument<"usc:Single"> | null;

	if (!serverRecord) {
		return res.status(200).json({
			statusCode: STATUS_CODES.NOT_FOUND,
			description: "No server record found.",
		});
	}

	const serverScore = await TachiScoreToServerScore(serverRecord);

	return res.status(200).json({
		statusCode: STATUS_CODES.SUCCESS,
		description: "Retrieved score.",
		body: serverScore,
	});
});

/**
 * Used to retrieve some particular useful subset of the scores from the server.
 * https://uscir.readthedocs.io/en/latest/endpoints/leaderboard.html
 * @name GET /ir/usc/charts/:chartHash/leaderboard
 */
router.get("/charts/:chartHash/leaderboard", RetrieveChart, async (req, res) => {
	const chart = req[SYMBOL_TachiData]!.uscChartDoc!;

	if (!(typeof req.query.mode === "string" && ["best", "rivals"].includes(req.query.mode))) {
		return res.status(200).json({
			statusCode: STATUS_CODES.BAD_REQ,
			description: `Invalid 'mode' param - expected 'best' or 'rivals'.`,
		});
	}

	if (typeof req.query.n !== "string") {
		return res.status(200).json({
			statusCode: STATUS_CODES.BAD_REQ,
			description: `Invalid 'n' param - expected a positive non-zero integer less than or equal to ${USCIR_MAX_LEADERBOARD_N}.`,
		});
	}

	let n;

	try {
		n = AssertStrAsPositiveNonZeroInt(req.query.n, "Invalid 'N' param.");
	} catch (err) {
		return res.status(200).json({
			statusCode: STATUS_CODES.BAD_REQ,
			description: `Invalid 'n' param - expected a positive non-zero integer less than or equal to ${USCIR_MAX_LEADERBOARD_N}.`,
		});
	}

	if (n >= USCIR_MAX_LEADERBOARD_N) {
		n = USCIR_MAX_LEADERBOARD_N;
	}

	const mode = req.query.mode as "best" | "rivals";

	if (mode === "rivals") {
		return res.status(200).json({
			statusCode: STATUS_CODES.BAD_REQ,
			description: "This is currently unsupported.",
		});
	}

	const bestScores = (await db["personal-bests"].find(
		{
			chartID: chart.chartID,
		},
		{
			sort: {
				"scoreData.perecent": -1,
			},
			limit: n,
		}
	)) as PBScoreDocument<"usc:Single">[];

	const serverScores = await Promise.all(bestScores.map(TachiScoreToServerScore));

	return res.status(200).json({
		statusCode: STATUS_CODES.SUCCESS,
		description: `Returned ${serverScores.length} scores.`,
		body: serverScores,
	});
});

/**
 * Sends a score to the server.
 * https://uscir.readthedocs.io/en/latest/endpoints/score-submit.html
 * @name POST /ir/usc/scores
 */
router.post("/scores", RequirePermissions("submit_score"), async (req, res) => {
	if (typeof req.body.chart !== "object" || req.body.chart === null) {
		return res.status(200).json({
			statusCode: STATUS_CODES.BAD_REQ,
			description: "Invalid chart provided.",
		});
	}

	if (typeof req.body.chart.chartHash !== "string") {
		return res.status(200).json({
			statusCode: STATUS_CODES.BAD_REQ,
			description: "Invalid chart provided.",
		});
	}

	const chartDoc = (await FindChartOnSHA256(
		"usc",
		req.body.chart.chartHash
	)) as ChartDocument<"usc:Single"> | null;

	if (!chartDoc) {
		return res.status(200).json({
			statusCode: STATUS_CODES.CHART_REFUSE,
			description: "This chart is not supported.",
		});
	}

	const userDoc = await GetUserWithID(req[SYMBOL_TachiAPIAuth]!.userID!);

	if (!userDoc) {
		logger.severe(`User ${req[SYMBOL_TachiAPIAuth]!.userID!} as no parent userDoc?`);
		return res.status(200).json({
			statusCode: STATUS_CODES.SERVER_ERROR,
			description: "An internal server error has occured.",
		});
	}

	const importParser = (logger: KtLogger) => ParseIRUSC(req.body, chartDoc, logger);

	const importRes = await ExpressWrappedScoreImportMain(userDoc, false, "ir/usc", importParser);

	if (importRes.statusCode === 500) {
		return res.status(200).json({
			statusCode: STATUS_CODES.SERVER_ERROR,
			description: importRes.body.description,
		});
	} else if (importRes.statusCode !== 200) {
		return res.status(200).json({
			statusCode: STATUS_CODES.BAD_REQ,
			description: importRes.body.description,
		});
	}

	const importDoc = (importRes.body as SuccessfulAPIResponse).body as ImportDocument;

	try {
		const body = await CreatePOSTScoresResponseBody(
			userDoc.id,
			chartDoc,
			importDoc.scoreIDs[0]
		);

		return res.status(200).json({
			statusCode: STATUS_CODES.SUCCESS,
			description: "Successfully imported score.",
			body,
		});
	} catch (err) {
		return res.status(200).json({
			statusCode: STATUS_CODES.SERVER_ERROR,
			description: "An internal server error has occured.",
		});
	}
});

/**
 * Used to submit the replay for a given score when requested by the server.
 * https://uscir.readthedocs.io/en/latest/endpoints/replay-submit.html
 * @name POST /ir/usc/replays
 */
router.post(
	"/replays",
	RequirePermissions("submit_score"),
	CreateMulterSingleUploadMiddleware("replay", ONE_MEGABYTE, logger),
	async (req, res) => {
		if (typeof req.body.identifier !== "string") {
			return res.status(200).json({
				statusCode: STATUS_CODES.BAD_REQ,
				description: "No Identifier Provided.",
			});
		}

		if (!req.file) {
			return res.status(200).json({
				statusCode: STATUS_CODES.BAD_REQ,
				description: "No File Provided.",
			});
		}

		const correspondingScore = await db.scores.findOne({
			userID: req[SYMBOL_TachiAPIAuth]!.userID!,
			game: "usc",
			scoreID: req.body.identifier,
		});

		if (!correspondingScore) {
			return res.status(200).json({
				statusCode: STATUS_CODES.NOT_FOUND,
				description: "No score corresponds to this identifier.",
			});
		}

		try {
			await CDNStore(GetUSCIRReplayURL(correspondingScore.scoreID), req.file.buffer);

			return res.status(200).json({
				statusCode: STATUS_CODES.SUCCESS,
				description: "Saved replay.",
				body: null,
			});
		} catch (err) {
			// impossible to test pretty much.
			/* istanbul ignore next */
			logger.error(`USCIR Replay Store error.`, { err });
			/* istanbul ignore next */
			return res.status(200).json({
				statusCode: STATUS_CODES.SERVER_ERROR,
				description: "An error has occured in storing the replay.",
			});
		}
	}
);

export default router;
