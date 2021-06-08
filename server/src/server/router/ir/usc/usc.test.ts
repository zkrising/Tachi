import t from "tap";
import db from "../../../../external/mongo/db";
import ResetDBState from "../../../../test-utils/resets";
import { CreatePOSTScoresResponseBody, KtchiScoreToServerScore } from "./usc";
import { ChartDocument, PBScoreDocument, ScoreDocument } from "kamaitachi-common";
import deepmerge from "deepmerge";
import { CloseAllConnections } from "../../../../test-utils/close-connections";

const mockScorePB: PBScoreDocument<"usc:Single"> = {
    chartID: "USC_CHART_ID",
    comments: [],
    calculatedData: {
        VF6: 0,
    },
    composedFrom: {
        scorePB: "USC_EXAMPLE_SCORE_PB_ID",
        lampPB: "USC_EXAMPLE_LAMP_PB_ID",
    },
    game: "usc",
    highlight: false,
    isPrimary: true,
    playtype: "Single",
    rankingData: {
        outOf: 2,
        rank: 1,
    },
    scoreData: {
        esd: null,
        grade: "AAA+",
        gradeIndex: 7,
        hitData: {
            critical: 100,
            miss: 15,
        },
        hitMeta: {},
        lamp: "EXCESSIVE CLEAR",
        lampIndex: 3,
        percent: 95,
        score: 9_500_000,
    },
    songID: 1,
    timeAchieved: null,
    userID: 1,
};

const mockScoreDocument = {
    scoreID: "USC_EXAMPLE_SCORE_PB_ID",
    scoreMeta: {
        noteMod: "MIRROR",
        gaugeMod: "HARD",
    },
} as ScoreDocument;

t.test("#KtchiScoreToServerScore", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should correctly convert a ktchiScore to a serverScore", async (t) => {
        await db.scores.insert(mockScoreDocument as ScoreDocument);

        const res = await KtchiScoreToServerScore(mockScorePB);

        t.strictSame(
            res,
            {
                score: 9_500_000,
                timestamp: 0,
                crit: 100,
                near: 0,
                error: 15,
                ranking: 1,
                lamp: 3,
                username: "test_zkldi",
                noteMod: "MIRROR",
                gaugeMod: "HARD",
            },
            "Should return the right ServerScore."
        );

        t.end();
    });

    t.test("Should work for timestamped scores", async (t) => {
        await db.scores.insert(mockScoreDocument);

        const res = await KtchiScoreToServerScore(
            deepmerge(mockScorePB, { timeAchieved: 1_621_844_762_995 })
        );

        t.strictSame(
            res,
            {
                score: 9_500_000,
                timestamp: 1_621_844_762,
                crit: 100,
                near: 0,
                error: 15,
                ranking: 1,
                lamp: 3,
                username: "test_zkldi",
                noteMod: "MIRROR",
                gaugeMod: "HARD",
            },
            "Should return the right ServerScore."
        );

        t.end();
    });

    t.test("Should throw if user document does not exist.", (t) => {
        t.rejects(() => KtchiScoreToServerScore(deepmerge(mockScorePB, { userID: 2 } as any)), {
            message: /User 2 from PB on chart.*has no user document\?/u,
        } as any);

        t.end();
    });

    t.test("Should throw if scorePB document does not exist.", (t) => {
        t.rejects(() => KtchiScoreToServerScore(mockScorePB), {
            message:
                /Score USC_EXAMPLE_SCORE_PB_ID does not exist, but is referenced in 1's PBDoc on/u,
        } as any);

        t.end();
    });

    t.end();
});

// yeah
const uscScorePBsSet = [
    {
        userID: 1,
        scoreData: {
            score: 9_000_000,
        },
        rankingData: {
            rank: 5,
            outOf: 10,
        },
    },
    {
        userID: 2,
        scoreData: {
            score: 9_100_000,
        },
        rankingData: {
            rank: 4,
            outOf: 10,
        },
    },
    {
        userID: 3,
        scoreData: {
            score: 9_200_000,
        },
        rankingData: {
            rank: 3,
            outOf: 10,
        },
    },
    {
        userID: 4,
        scoreData: {
            score: 9_300_000,
        },
        rankingData: {
            rank: 2,
            outOf: 10,
        },
    },
    {
        userID: 5,
        scoreData: {
            score: 9_400_000,
        },
        rankingData: {
            rank: 1,
            outOf: 10,
        },
    },
    {
        userID: 6,
        scoreData: {
            score: 8_900_000,
        },
        rankingData: {
            rank: 6,
            outOf: 10,
        },
    },
    {
        userID: 7,
        scoreData: {
            score: 8_800_000,
        },
        rankingData: {
            rank: 7,
            outOf: 10,
        },
    },
    {
        userID: 8,
        scoreData: {
            score: 8_700_000,
        },
        rankingData: {
            rank: 8,
            outOf: 10,
        },
    },
    {
        userID: 9,
        scoreData: {
            score: 8_600_000,
        },
        rankingData: {
            rank: 9,
            outOf: 10,
        },
    },
    {
        userID: 10,
        scoreData: {
            score: 8_500_000,
        },
        rankingData: {
            rank: 10,
            outOf: 10,
        },
    },
].map((e) => deepmerge(mockScorePB, e) as any);

const mockUserDocs = [2, 3, 4, 5, 6, 7, 8, 9, 10].map((e) => ({
    id: e,
    username: e.toString(),
})) as any;

t.test("#CreatePOSTScoresResponseBody", async (t) => {
    t.beforeEach(ResetDBState);

    const chartDoc = (await db.charts.usc.findOne()) as ChartDocument<"usc:Single">;

    t.test("Should correctly return POSTScoresResponseBody", async (t) => {
        await db.scores.insert(mockScoreDocument);

        await db["score-pbs"].insert(uscScorePBsSet);
        await db.users.insert(mockUserDocs);

        await db.scores.insert({
            scoreID: "USER_1_SCORE_PB",
            scoreMeta: {
                replayID: "foo_bar",
            },
        } as any);

        const res = await CreatePOSTScoresResponseBody(
            1,
            chartDoc as ChartDocument<"usc:Single">,
            "USER_1_SCORE_PB"
        );

        t.hasStrict(res, {
            score: {
                score: 9_000_000,
                username: "test_zkldi",
                ranking: 5,
            },
            serverRecord: {
                score: 9_400_000,
                username: "5",
                ranking: 1,
            },
            isServerRecord: false,
            isPB: false,
            sendReplay: "USER_1_SCORE_PB",
            adjacentAbove: [
                { score: 9_300_000, username: "4", ranking: 2 },
                { score: 9_200_000, username: "3", ranking: 3 },
                { score: 9_100_000, username: "2", ranking: 4 },
            ],
            adjacentBelow: [
                { score: 8_900_000, username: "6", ranking: 6 },
                { score: 8_800_000, username: "7", ranking: 7 },
                { score: 8_700_000, username: "8", ranking: 8 },
            ],
        });

        t.end();
    });

    t.test("Should not return serverRecord in adjacentAbove", async (t) => {
        await db.scores.insert(mockScoreDocument);

        await db["score-pbs"].insert(uscScorePBsSet);
        await db.users.insert(mockUserDocs);

        await db.scores.insert({
            scoreID: "USER_4_SCORE_PB",
        } as any);

        const res = await CreatePOSTScoresResponseBody(4, chartDoc, "USER_4_SCORE_PB");

        t.hasStrict(res, {
            score: {
                score: 9_300_000,
                username: "4",
                ranking: 2,
            },
            serverRecord: {
                ranking: 1,
            },
            isServerRecord: false,
            isPB: false,
            sendReplay: "USER_4_SCORE_PB",
        });

        t.strictSame(
            res.adjacentAbove.map((e) => e.ranking),
            []
        );

        t.strictSame(
            res.adjacentBelow.map((e) => e.ranking),
            [3, 4, 5]
        );

        t.end();
    });

    t.test("Should trim serverRecord in adjacentAbove", async (t) => {
        await db.scores.insert(mockScoreDocument);

        await db["score-pbs"].insert(uscScorePBsSet);
        await db.users.insert(mockUserDocs);

        await db.scores.insert({
            scoreID: "USER_3_SCORE_PB",
        } as any);

        const res = await CreatePOSTScoresResponseBody(3, chartDoc, "USER_3_SCORE_PB");

        t.hasStrict(res, {
            score: {
                score: 9_200_000,
                username: "3",
                ranking: 3,
            },
            serverRecord: {
                ranking: 1,
            },
            isServerRecord: false,
            isPB: false,
            sendReplay: "USER_3_SCORE_PB",
        });

        t.strictSame(
            res.adjacentAbove.map((e) => e.ranking),
            [2]
        );

        t.strictSame(
            res.adjacentBelow.map((e) => e.ranking),
            [4, 5, 6]
        );

        t.end();
    });

    t.test("Should throw on no ScorePB", async (t) => {
        await db.scores.insert(mockScoreDocument);

        // await db["score-pbs"].insert(uscScorePBsSet);
        await db.users.insert(mockUserDocs);

        await db.scores.insert({
            scoreID: "USER_1_SCORE_PB",
            scoreMeta: {
                replayID: "foo_bar",
            },
        } as any);

        t.rejects(() => CreatePOSTScoresResponseBody(1, chartDoc, "USER_1_SCORE_PB"), {
            message: /Score was imported for chart, but no ScorePB was available on this chart/u,
        } as any);

        t.end();
    });

    t.test("Should throw on no original score", async (t) => {
        await db.scores.insert(mockScoreDocument);

        await db["score-pbs"].insert(uscScorePBsSet);
        await db.users.insert(mockUserDocs);

        // await db.scores.insert({
        //     scoreID: "USER_1_SCORE_PB",
        //     scoreMeta: {
        //         replayID: "foo_bar",
        //     },
        // } as any);

        t.rejects(() => CreatePOSTScoresResponseBody(1, chartDoc, "USER_1_SCORE_PB"), {
            message: /Score with ID USER_1_SCORE_PB is not in the database/u,
        } as any);

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
