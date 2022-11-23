import { CreatePOSTScoresResponseBody, TachiScoreToServerScore } from "./usc";
import { Router } from "express";
import db from "external/mongo/db";
import { CDNStoreOrOverwrite } from "lib/cdn/cdn";
import { GetUSCIRReplayURL } from "lib/cdn/url-format";
import { ONE_MEGABYTE } from "lib/constants/filesize";
import { SYMBOL_TACHI_API_AUTH } from "lib/constants/tachi";
import { USCIR_MAX_LEADERBOARD_N } from "lib/constants/usc-ir";
import CreateLogCtx from "lib/logger/logger";
import { AssertStrAsPositiveNonZeroInt } from "lib/score-import/framework/common/string-asserts";
import { ExpressWrappedScoreImportMain } from "lib/score-import/framework/express-wrapper";
import { ServerConfig, TachiConfig } from "lib/setup/config";
import p from "prudence";
import { RejectIfBanned, RequirePermissions } from "server/middleware/auth";
import { CreateMulterSingleUploadMiddleware } from "server/middleware/multer-upload";
import { FormatPrError } from "utils/prudence";
import { AssignToReqTachiData, GetTachiData } from "utils/req-tachi-data";
import type { USCClientChart } from "./types";
import type { RequestHandler } from "express";
import type {
	ChartDocument,
	ImportDocument,
	PBScoreDocument,
	Playtypes,
	SuccessfulAPIResponse,
} from "tachi-common";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

enum STATUS_CODES {
	UNAUTH = 41,
	CHART_REFUSE = 42,
	FORBIDDEN = 43,
	NOT_FOUND = 44,
	SERVER_ERROR = 50,
	SUCCESS = 20,
	ACCEPTED = 22,
	BAD_REQ = 40,
}

const ValidateUSCRequest: RequestHandler = async (req, res, next) => {
	const token = req.header("Authorization");

	if (token === undefined) {
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

	req[SYMBOL_TACHI_API_AUTH] = uscAuthDoc;

	next();
};

router.use((req, res, next) => {
	if (req.params.playtype !== "Keyboard" && req.params.playtype !== "Controller") {
		return res.status(400).json({
			success: false,
			description: "Invalid playtype. Expected Keyboard or Controller.",
		});
	}

	next();
});

// since USC handrolls its own auth code, we need to also reject banned users.
router.use(RejectIfBanned);

router.use(ValidateUSCRequest);

// This is an implementation of the USCIR spec as per https://uscir.readthedocs.io.
// This specification always returns 200 OK, regardless of whether the result was okay
// as the HTTP code is used to determine whether the server received the request properly,
// rather than the result of the request.

/**
 * Used to check your connection to the server, and receive some basic information.
 * https://uscir.readthedocs.io/en/latest/endpoints/heartbeat.html
 * @name GET /ir/usc/:playtype
 */
router.get("/", (req, res) =>
	res.status(200).json({
		statusCode: STATUS_CODES.SUCCESS,
		description: "IR Request Successful.",
		body: {
			serverTime: Math.floor(Date.now() / 1000),
			serverName: TachiConfig.NAME,
			irVersion: "0.4.0-a",
		},
	})
);

const RetrieveChart: RequestHandler = async (req, res, next) => {
	const chart = await db.charts.usc.findOne({
		"data.hashSHA1": req.params.chartHash,
		playtype: req.params.playtype as Playtypes["usc"],
	});

	if (!chart) {
		return res.status(200).json({
			statusCode: STATUS_CODES.NOT_FOUND,
			description: `This IR doesn't have any record data yet, or ${
				ServerConfig.USC_QUEUE_SIZE
			} ${
				ServerConfig.USC_QUEUE_SIZE === 1 ? "person has" : "people have"
			} not played the chart yet.`,
		});
	}

	AssignToReqTachiData(req, {
		uscChartDoc: chart as ChartDocument<"usc:Controller" | "usc:Keyboard">,
	});

	next();
};

/**
 * Used to check if the server will accept a score for a given chart in advance of submitting it.
 * https://uscir.readthedocs.io/en/latest/endpoints/chart-charthash.html
 * @name GET /ir/usc/:playtype/charts/:chartHash
 */
router.get("/charts/:chartHash", RetrieveChart, (req, res) => {
	return res.status(200).json({
		statusCode: STATUS_CODES.SUCCESS,
		description: "This chart is tracked by the IR.",
		body: {},
	});
});

/**
 * Used to retrieve the current server record for the chart with the specified hash.
 * https://uscir.readthedocs.io/en/latest/endpoints/record.html
 * @name GET /ir/usc/:playtype/charts/:chartHash/record
 */
router.get("/charts/:chartHash/record", RetrieveChart, async (req, res) => {
	const chart = GetTachiData(req, "uscChartDoc");

	const serverRecord = (await db["personal-bests"].findOne({
		chartID: chart.chartID,
		"rankingData.rank": 1,
	})) as PBScoreDocument<"usc:Controller" | "usc:Keyboard"> | null;

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
		body: { record: serverScore },
	});
});

/**
 * Used to retrieve some particular useful subset of the scores from the server.
 * https://uscir.readthedocs.io/en/latest/endpoints/leaderboard.html
 * @name GET /ir/usc/:playtype/charts/:chartHash/leaderboard
 */
router.get("/charts/:chartHash/leaderboard", RetrieveChart, async (req, res) => {
	const chart = GetTachiData(req, "uscChartDoc");

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
	} catch (_err) {
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
				"scoreData.percent": -1,
			},
			limit: n,
		}
	)) as Array<PBScoreDocument<"usc:Controller" | "usc:Keyboard">>;

	const serverScores = await Promise.all(bestScores.map(TachiScoreToServerScore));

	return res.status(200).json({
		statusCode: STATUS_CODES.SUCCESS,
		description: `Returned ${serverScores.length} scores.`,
		body: serverScores,
	});
});

const PR_USCIR_CHART_DOC = {
	chartHash: "string",
	artist: "string",
	title: "string",
	level: p.isBoundedInteger(1, 20),
	difficulty: p.isBoundedInteger(0, 3),
	effector: "string",
	illustrator: "string",
	bpm: "string",
};

/**
 * Sends a score to the server.
 * https://uscir.readthedocs.io/en/latest/endpoints/score-submit.html
 * @name POST /ir/usc/:playtype/scores
 */
router.post("/scores", RequirePermissions("submit_score"), async (req, res) => {
	const playtype = req.params.playtype as Playtypes["usc"];

	const chartErr = p(
		req.safeBody.chart,
		PR_USCIR_CHART_DOC,
		{},
		{
			throwOnNonObject: false,
			allowExcessKeys: true,
		}
	);

	if (chartErr) {
		return res.status(200).json({
			statusCode: STATUS_CODES.BAD_REQ,
			description: FormatPrError(chartErr, "Invalid chart."),
		});
	}

	const uscChart = req.safeBody.chart as USCClientChart;

	const chartDoc = (await db.charts.usc.findOne({
		"data.hashSHA1": uscChart.chartHash,
		playtype,
	})) as ChartDocument<"usc:Controller" | "usc:Keyboard"> | null;

	const userID = req[SYMBOL_TACHI_API_AUTH].userID!;

	const importRes = await ExpressWrappedScoreImportMain(userID, false, "ir/usc", [
		req.safeBody,
		uscChart.chartHash,
		playtype,
	]);

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

	// If the import failed, AND the import failure WAS NOT that the chart didnt exist
	// report that error instead.
	if (importDoc.errors[0] && importDoc.errors[0].type !== "KTDataNotFound") {
		logger.info(`USC Import Failed ${importDoc.errors[0].message}`, {
			importDoc,
			userID,
		});

		return res.status(200).json({
			statusCode: STATUS_CODES.BAD_REQ,
			description: `${importDoc.errors[0].type} ${importDoc.errors[0].message}`,
		});
	}

	// If this was an orphan chart request, return ACCEPTED,
	// since it may be unorphaned in the future
	if (!chartDoc) {
		return res.status(200).json({
			statusCode: STATUS_CODES.ACCEPTED,
			description: `This score has been saved, but the chart is not currently on the IR.`,
			body: {},
		});
	}

	// If the chartDoc exists, any error is a failure here.
	if (importDoc.errors[0]) {
		logger.info(`USC Import Failed ${importDoc.errors[0].message}`, {
			importDoc,
			userID,
		});

		return res.status(200).json({
			statusCode: STATUS_CODES.BAD_REQ,
			description: `${importDoc.errors[0].type} ${importDoc.errors[0].message}`,
		});
	}

	if (importDoc.scoreIDs[0] === undefined) {
		return res.status(200).json({
			statusCode: STATUS_CODES.SUCCESS,
			description: "Score was identical to another score you already have.",
		});
	}

	try {
		const body = await CreatePOSTScoresResponseBody(userID, chartDoc, importDoc.scoreIDs[0]);

		return res.status(200).json({
			statusCode: STATUS_CODES.SUCCESS,
			description: "Successfully imported score.",
			body,
		});
	} catch (_err) {
		return res.status(200).json({
			statusCode: STATUS_CODES.SERVER_ERROR,
			description: "An internal server error has occured.",
		});
	}
});

/**
 * Used to submit the replay for a given score when requested by the server.
 * https://uscir.readthedocs.io/en/latest/endpoints/replay-submit.html
 * @name POST /ir/usc/:playtype/replays
 */
router.post(
	"/replays",
	RequirePermissions("submit_score"),
	CreateMulterSingleUploadMiddleware("replay", ONE_MEGABYTE, logger, false),
	async (req, res) => {
		if (typeof req.safeBody.identifier !== "string") {
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

		// The userID and game thing here are VALIDATION!
		// The score MUST belong to the requesting user and
		// MUST also be for USC.
		// Otherwise, anyone could overwrite anyone elses
		// score replays!
		const correspondingScore = await db.scores.findOne({
			userID: req[SYMBOL_TACHI_API_AUTH].userID!,
			scoreID: req.safeBody.identifier,
			game: "usc",
		});

		if (!correspondingScore) {
			return res.status(200).json({
				statusCode: STATUS_CODES.NOT_FOUND,
				description: "No score corresponds to this identifier.",
			});
		}

		try {
			await CDNStoreOrOverwrite(
				GetUSCIRReplayURL(correspondingScore.scoreID),
				req.file.buffer
			);

			return res.status(200).json({
				statusCode: STATUS_CODES.SUCCESS,
				description: "Saved replay.",
				body: {},
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
