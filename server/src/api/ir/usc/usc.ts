import { Router, RequestHandler } from "express";
import { FindChartOnSHA256 } from "../../../common/database-lookup/chart";
import { SYMBOL_KtchiData } from "../../../constants/ktchi";
import db from "../../../db/db";
import {
    ChartDocument,
    PBScoreDocument,
    SuccessfulAPIResponse,
    ImportDocument,
} from "kamaitachi-common";
import { AssertStrAsPositiveNonZeroInt } from "../../../score-import/framework/common/string-asserts";
import CreateLogCtx from "../../../common/logger";
import {
    CreatePOSTScoresResponseBody,
    KtchiScoreToServerScore,
    POSTScoresResponseBody,
} from "./common";
import { ExpressWrappedScoreImportMain } from "../../../score-import/framework/express-wrapper";
import { GetUserWithID } from "../../../common/user";
import { KtLogger } from "../../../types";
import { ParseIRUSC } from "../../../score-import/import-types/ir/usc/parser";
import { GetPBOnChart, GetServerRecordOnChart } from "../../../common/scores";
import crypto from "crypto";
import { Random20Hex } from "../../../common/util";
import { USCIR_ADJACENT_SCORE_N, USCIR_MAX_LEADERBOARD_N } from "../../../constants/usc-ir";
import { CreateMulterSingleUploadMiddleware } from "../../../common/multer";

const logger = CreateLogCtx("usc.ts");

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

// This is an implementation of the USCIR spec as per https://uscir.readthedocs.io.
// This specification always returns 200 OK, regardless of whether the result was okay
// as the HTTP code is used to determine whether the server received the request properly,
// rather than the result of the request.

const ValidateUSCRequest: RequestHandler = async (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(200).json({
            statusCode: STATUS_CODES.UNAUTH,
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

    const uscAuthDoc = await db["usc-auth-tokens"].findOne({
        token: splitToken[1],
    });

    if (!uscAuthDoc) {
        return res.status(200).json({
            statusCode: STATUS_CODES.UNAUTH,
            description: "Unauthorized.",
        });
    }

    req[SYMBOL_KtchiData] = { uscAuthDoc };

    return next();
};

router.use(ValidateUSCRequest);

/**
 * Used to check your connection to the server, and receive some basic information.
 * https://uscir.readthedocs.io/en/latest/endpoints/heartbeat.html
 * @name GET /api/ir/usc
 */
router.get("/", (req, res) =>
    res.status(200).json({
        statusCode: STATUS_CODES.SUCCESS,
        description: "IR Request Successful.",
        body: {
            serverTime: Math.floor(Date.now() / 1000),
            serverName: "Kamaitachi BLACK",
            irVersion: "0.3.0-a",
        },
    })
);

const RetrieveChart: RequestHandler = async (req, res, next) => {
    const chart = await FindChartOnSHA256("usc", req.params.chartHash);

    req[SYMBOL_KtchiData]!.uscChartDoc = (chart ?? undefined) as
        | ChartDocument<"usc:Single">
        | undefined;

    return next();
};

/**
 * Used to check if the server will accept a score for a given chart in advance of submitting it.
 * https://uscir.readthedocs.io/en/latest/endpoints/chart-charthash.html
 * @name GET /api/ir/usc/charts/:chartHash
 */
router.get("/charts/:chartHash", RetrieveChart, (req, res) => {
    const chart = req[SYMBOL_KtchiData]!.uscChartDoc;

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
 * @name GET /api/ir/usc/charts/:chartHash/record
 */
router.get("/charts/:chartHash/record", RetrieveChart, async (req, res) => {
    const chart = req[SYMBOL_KtchiData]!.uscChartDoc;

    // spec ambigious here

    if (!chart) {
        return res.status(200).json({
            statusCode: STATUS_CODES.CHART_REFUSE,
            description: "This IR is not currently tracking this chart.",
        });
    }

    const serverRecord = (await db["score-pbs"].findOne({
        chartID: chart.chartID,
        "rankingData.rank": 1,
    })) as PBScoreDocument<"usc:Single"> | null;

    if (!serverRecord) {
        return res.status(200).json({
            success: STATUS_CODES.NOT_FOUND,
            description: "No server record found.",
        });
    }

    const serverScore = await KtchiScoreToServerScore(serverRecord);

    return res.status(200).json({
        success: STATUS_CODES.SUCCESS,
        description: "Retrieved score.",
        body: serverScore,
    });
});

/**
 * Used to retrieve some particular useful subset of the scores from the server.
 * https://uscir.readthedocs.io/en/latest/endpoints/leaderboard.html
 * @name GET /api/ir/usc/charts/:chartHash/leaderboard
 */
router.get("/charts/:chartHash/leaderboard", RetrieveChart, async (req, res) => {
    const chart = req[SYMBOL_KtchiData]!.uscChartDoc!;

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
        return res.status(200).json({
            statusCode: STATUS_CODES.BAD_REQ,
            description: `Invalid 'n' param - expected a positive non-zero integer less than or equal to ${USCIR_MAX_LEADERBOARD_N}.`,
        });
    }

    const mode = req.query.mode as "best" | "rivals";

    if (mode === "rivals") {
        return res.status(200).json({
            statusCode: STATUS_CODES.BAD_REQ,
            description: "This is currently unsupported.",
        });
    }

    const bestScores = (await db["score-pbs"].find(
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

    const serverScores = await Promise.all(bestScores.map(KtchiScoreToServerScore));

    return res.status(200).json({
        statusCode: STATUS_CODES.SUCCESS,
        description: `Returned ${serverScores.length} scores.`,
        body: serverScores,
    });
});

/**
 * Sends a score to the server.
 * https://uscir.readthedocs.io/en/latest/endpoints/score-submit.html
 * @name POST /api/ir/usc/scores
 */
router.post("/scores", async (req, res) => {
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

    const userDoc = await GetUserWithID(req[SYMBOL_KtchiData]!.uscAuthDoc!.userID);

    if (!userDoc) {
        logger.severe(`User ${req[SYMBOL_KtchiData]!.uscAuthDoc!.userID} as no parent userDoc?`);
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
        const body = await CreatePOSTScoresResponseBody(userDoc, chartDoc, importDoc);

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
 * @name POST /api/ir/usc/replays
 */
router.post("/replays", CreateMulterSingleUploadMiddleware("replay"), async (req, res) => {
    if (typeof req.body.identifier !== "string") {
        return res.status(200).json({
            statusCode: STATUS_CODES.BAD_REQ,
            description: "No Identifier Provided.",
        });
    }

    const correspondingScore = await db.scores.findOne({
        userID: req[SYMBOL_KtchiData]!.uscAuthDoc!.userID,
        game: "usc",
        "scoreMeta.replayID": req.body.identifier,
    });

    if (!correspondingScore) {
        return res.status(200).json({
            statusCode: STATUS_CODES.NOT_FOUND,
            description: "No score corresponds to this identifier.",
        });
    }

    // @todo #113 Properly store replays sent with POST /replays.

    return res.status(200).json({
        statusCode: STATUS_CODES.SUCCESS,
        description: "Saved replay.",
        body: null,
    });
});

export default router;
