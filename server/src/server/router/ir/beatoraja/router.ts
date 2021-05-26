import { Router } from "express";
import db from "../../../../external/mongo/db";
import { SYMBOL_KtchiData } from "../../../../lib/constants/ktchi";
import CreateLogCtx, { KtLogger } from "../../../../lib/logger/logger";
import { ExpressWrappedScoreImportMain } from "../../../../lib/score-import/framework/express-wrapper";
import { ParseBeatorajaSingle } from "../../../../lib/score-import/import-types/ir/beatoraja/parser";
import { Random20Hex } from "../../../../utils/misc";
import {
    GetUserWithIDGuaranteed,
    PRIVATEINFO_GetUserCaseInsensitive,
} from "../../../../utils/user";
import prValidate from "../../../middleware/prudence-validate";
import { PasswordCompare } from "../../api/v1/auth/auth";
import { ValidateAuthToken, ValidateIRClientVersion } from "./auth";
import chartsRouter from "./charts/router";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

router.use(ValidateIRClientVersion);

/**
 * Takes a username and password and returns a unique auth token for the user
 * to make ir requests with.
 * @name POST /ir/beatoraja/login
 */
router.post(
    "/login",
    prValidate({
        username: "string",
        password: "string",
    }),
    async (req, res) => {
        const userDoc = await PRIVATEINFO_GetUserCaseInsensitive(req.body.username);

        if (!userDoc) {
            return res.status(404).json({
                success: false,
                description: `The user ${req.body.username} does not exist.`,
            });
        }

        const validPassword = PasswordCompare(req.body.password, userDoc.password);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                description: `Invalid password.`,
            });
        }

        // User is who they claim to be.
        const token = Random20Hex();

        await db["beatoraja-auth-tokens"].insert({
            userID: userDoc.id,
            token,
        });

        return res.status(200).json({
            success: true,
            description: `Successfully created auth token.`,
            body: {
                token,
            },
        });
    }
);

router.use(ValidateAuthToken);

/**
 * Submits a beatoraja score to Kamaitachi. If the chart is unavailable,
 * store it as a new chart alongside the new score.
 * @name POST /ir/beatoraja/submit-score
 */
router.post("/submit-score", async (req, res) => {
    const userDoc = await GetUserWithIDGuaranteed(req[SYMBOL_KtchiData]!.beatorajaAuthDoc!.userID);

    const ParserFunction = (logger: KtLogger) => ParseBeatorajaSingle(req.body, logger);

    const importRes = await ExpressWrappedScoreImportMain(
        userDoc,
        false,
        "ir/beatoraja",
        ParserFunction
    );

    if (!importRes.body.success) {
        return res.status(400).json(importRes.body);
    } else if (importRes.body.body.errors.length !== 0) {
        // since we're only ever importing one score, we can guarantee
        // that this means the score we tried to import was skipped.
        return res.status(400).json({
            success: false,
            description: `[${importRes.body.body.errors[0].type}] - ${importRes.body.body.errors[0].message}`,
        });
    }

    const scoreDoc = await db.scores.findOne({
        scoreID: importRes.body.body.scoreIDs[0],
    });

    if (!scoreDoc) {
        logger.severe(
            `ScoreDocument ${importRes.body.body.scoreIDs[0]} was claimed to be inserted, but wasn't.`
        );
        return res.status(500).json({
            success: false,
            description: "Internal Service Error.",
        });
    }

    const chart = await db.charts.bms.findOne({
        chartID: scoreDoc.chartID,
    });

    const song = await db.songs.bms.findOne({
        id: chart!.songID,
    });

    return res.status(importRes.statusCode).json({
        success: true,
        description: "Imported score.",
        body: {
            score: scoreDoc,
            song,
            chart,
            import: importRes.body.body,
        },
    });
});

/**
 * Submits a course result to Kamaitachi. This only accepts a limited set of
 * courses - all of which are dans.
 * @name POST /ir/beatoraja/submit-course
 */
router.post("/submit-course", async (req, res) => {});

router.use("/charts/:chartSHA256", chartsRouter);

export default router;
