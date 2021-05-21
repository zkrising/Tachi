import { Router, RequestHandler } from "express";
import { FindChartOnSHA256 } from "../../../common/database-lookup/chart";
import { SYMBOL_KtchiData } from "../../../constants/ktchi";
import db from "../../../db/db";
import { ChartDocument, PBScoreDocument } from "kamaitachi-common";
import { AssertStrAsPositiveNonZeroInt } from "../../../score-import/framework/common/string-asserts";
import CreateLogCtx from "../../../common/logger";
import { KtchiScoreToServerScore } from "./common";

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

const MAX_N = 10;

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
        // @todo See uscir-spec #1
        return res.status(200).json({
            success: STATUS_CODES.SERVER_ERROR,
            description: "TODO",
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
            description: `Invalid 'n' param - expected a positive non-zero integer less than or equal to ${MAX_N}.`,
        });
    }

    let n;

    try {
        n = AssertStrAsPositiveNonZeroInt(req.query.n, "Invalid 'N' param.");
    } catch (err) {
        return res.status(200).json({
            statusCode: STATUS_CODES.BAD_REQ,
            description: `Invalid 'n' param - expected a positive non-zero integer less than or equal to ${MAX_N}.`,
        });
    }

    if (n >= MAX_N) {
        return res.status(200).json({
            statusCode: STATUS_CODES.BAD_REQ,
            description: `Invalid 'n' param - expected a positive non-zero integer less than or equal to ${MAX_N}.`,
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
router.post("/scores", async (req, res) => {});

export default router;
