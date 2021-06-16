import t from "tap";
import db from "../../../../external/mongo/db";
import { CloseAllConnections } from "../../../../test-utils/close-connections";
import ResetDBState from "../../../../test-utils/resets";
import { TestingIIDXSPScore, TestingIIDXSPScorePB } from "../../../../test-utils/test-data";
import { CreateScoreLogger } from "../common/import-logger";
import { CreateSessions, LoadScoresIntoSessions } from "./sessions";
import { PublicUserDocument, ScoreDocument, SessionDocument } from "tachi-common";
import deepmerge from "deepmerge";

const logger = CreateScoreLogger(
    { username: "test_zkldi", id: 1 } as PublicUserDocument,
    "foo",
    "ir/direct-manual"
);

t.test("#CreateSessions", (t) => {
    t.beforeEach(ResetDBState);
    t.beforeEach(() => db.sessions.remove({}));

    t.test("Should compose sessions from one timestamped score provided.", async (t) => {
        const res = await CreateSessions(
            1,
            "ir/direct-manual",
            "iidx",
            { SP: [TestingIIDXSPScore] },
            logger
        );

        t.match(res, [
            {
                sessionID: /^Q[a-f0-9]{40}$/u,
                type: "Created",
            },
        ]);

        t.equal(res.length, 1);

        const session = await db.sessions.findOne({ userID: 1, game: "iidx", playtype: "SP" });

        const sessionCount = await db.sessions.count({ userID: 1, game: "iidx", playtype: "SP" });

        t.equal(sessionCount, 1);

        t.hasStrict(session, {
            userID: 1,
            importType: "ir/direct-manual",
            // name: "adjective1 adjective2 noun1",
            sessionID: res[0].sessionID,
            desc: null,
            game: "iidx",
            playtype: "SP",
            highlight: false,
            scoreInfo: [
                {
                    scoreID: "TESTING_SCORE_ID",
                    isNewScore: true,
                },
            ],
            // timeInserted: 1622289329729,
            timeStarted: 1619454485988,
            timeEnded: 1619454485988,
            calculatedData: {},
        });

        t.end();
    });

    t.test("Should not compose sessions from untimestamped scores.", async (t) => {
        const res = await CreateSessions(
            1,
            "ir/direct-manual",
            "iidx",
            { SP: [deepmerge(TestingIIDXSPScore, { timeAchieved: null })] },
            logger
        );

        t.strictSame(res, []);

        const sessionCount = await db.sessions.count({ userID: 1, game: "iidx", playtype: "SP" });

        t.equal(sessionCount, 0);

        t.end();
    });

    t.test("Should compose sessions for multiple playtypes.", async (t) => {
        const res = await CreateSessions(
            1,
            "ir/direct-manual",
            "iidx",
            { DP: [deepmerge(TestingIIDXSPScore, { playtype: "DP" })], SP: [TestingIIDXSPScore] },
            logger
        );

        t.equal(res.length, 2);

        const sessionCount = await db.sessions.count({ userID: 1, game: "iidx", playtype: "SP" });

        t.equal(sessionCount, 1);

        const sessionCountDP = await db.sessions.count({ userID: 1, game: "iidx", playtype: "DP" });

        t.equal(sessionCountDP, 1);

        t.end();
    });
    t.end();
});

// just an arbitrary start point for our sessions as an offset
const start = 1619454485988;

t.test("#LoadScoresIntoSessions", (t) => {
    t.beforeEach(ResetDBState);
    t.beforeEach(() => db.sessions.remove({}));

    t.test("Should create sessions from scores.", async (t) => {
        const res = await LoadScoresIntoSessions(
            1,
            "ir/direct-manual",
            [null, start, start + 1000, start + 2000, start + 3000].map((e, i) =>
                deepmerge(TestingIIDXSPScore, { timeAchieved: e, scoreID: `SCORE_ID_${i}` })
            ) as ScoreDocument[],
            "iidx",
            "SP",
            logger
        );

        t.match(res, [
            {
                sessionID: /^Q[a-f0-9]{40}$/u,
                type: "Created",
            },
        ]);

        const sessions = await db.sessions.find({ game: "iidx", playtype: "SP", userID: 1 });

        t.equal(sessions.length, 1);

        t.strictSame(sessions[0].scoreInfo, [
            {
                scoreID: "SCORE_ID_1",
                isNewScore: true,
            },
            {
                scoreID: "SCORE_ID_2",
                isNewScore: true,
            },
            {
                scoreID: "SCORE_ID_3",
                isNewScore: true,
            },
            {
                scoreID: "SCORE_ID_4",
                isNewScore: true,
            },
        ]);

        t.end();
    });

    t.test("Should sort scores before creating sessions.", async (t) => {
        const res = await LoadScoresIntoSessions(
            1,
            "ir/direct-manual",
            [null, start, start - 4000, start + 2000, start - 3000, null, start + 1000].map(
                (e, i) =>
                    deepmerge(TestingIIDXSPScore, { timeAchieved: e, scoreID: `SCORE_ID_${i}` })
            ) as ScoreDocument[],
            "iidx",
            "SP",
            logger
        );

        t.match(res, [
            {
                sessionID: /^Q[a-f0-9]{40}$/u,
                type: "Created",
            },
        ]);

        const sessions = await db.sessions.find({ game: "iidx", playtype: "SP", userID: 1 });

        t.equal(sessions.length, 1);

        t.strictSame(sessions[0].scoreInfo, [
            {
                scoreID: "SCORE_ID_2",
                isNewScore: true,
            },
            {
                scoreID: "SCORE_ID_4",
                isNewScore: true,
            },
            {
                scoreID: "SCORE_ID_1",
                isNewScore: true,
            },
            {
                scoreID: "SCORE_ID_6",
                isNewScore: true,
            },
            {
                scoreID: "SCORE_ID_3",
                isNewScore: true,
            },
        ]);

        t.end();
    });

    const TWO_HOURS = 1000 * 60 * 60 * 2;

    t.test("Should create multiple sessions if scores are far apart.", async (t) => {
        const res = await LoadScoresIntoSessions(
            1,
            "ir/direct-manual",
            [
                null,
                start,
                start + 1000,
                start + 2000,
                start + TWO_HOURS + 4000,
                start + TWO_HOURS + 5000,
                start + TWO_HOURS + 6000,
            ].map((e, i) =>
                deepmerge(TestingIIDXSPScore, { timeAchieved: e, scoreID: `SCORE_ID_${i}` })
            ) as ScoreDocument[],
            "iidx",
            "SP",
            logger
        );

        t.match(res, [
            {
                sessionID: /^Q[a-f0-9]{40}$/u,
                type: "Created",
            },
            {
                sessionID: /^Q[a-f0-9]{40}$/u,
                type: "Created",
            },
        ]);

        const sessions = await db.sessions.find({ game: "iidx", playtype: "SP", userID: 1 });

        t.equal(sessions.length, 2);

        t.strictSame(sessions[0].scoreInfo, [
            {
                scoreID: "SCORE_ID_1",
                isNewScore: true,
            },
            {
                scoreID: "SCORE_ID_2",
                isNewScore: true,
            },
            {
                scoreID: "SCORE_ID_3",
                isNewScore: true,
            },
        ]);
        t.strictSame(sessions[1].scoreInfo, [
            {
                scoreID: "SCORE_ID_4",
                isNewScore: true,
            },
            {
                scoreID: "SCORE_ID_5",
                isNewScore: true,
            },
            {
                scoreID: "SCORE_ID_6",
                isNewScore: true,
            },
        ]);

        t.end();
    });

    t.test("Should append to existing sessions.", async (t) => {
        await db.sessions.insert({
            sessionID: "EXAMPLE_SESSION_ID",
            userID: 1,
            game: "iidx",
            playtype: "SP",
            importType: "ir/direct-manual",
            timeStarted: start,
            timeEnded: start,
            scoreInfo: [
                {
                    scoreID: "EXAMPLE_SCORE_ID",
                    isNewScore: true,
                },
            ],
        } as SessionDocument);

        const res = await LoadScoresIntoSessions(
            1,
            "ir/direct-manual",
            [null, start, start + 1000, start + 2000].map((e, i) =>
                deepmerge(TestingIIDXSPScore, { timeAchieved: e, scoreID: `SCORE_ID_${i}` })
            ) as ScoreDocument[],
            "iidx",
            "SP",
            logger
        );

        t.strictSame(res, [
            {
                sessionID: "EXAMPLE_SESSION_ID",
                type: "Appended",
            },
        ]);

        const sessions = await db.sessions.find({ game: "iidx", playtype: "SP", userID: 1 });

        t.equal(sessions.length, 1);

        t.strictSame(sessions[0].scoreInfo, [
            {
                scoreID: "EXAMPLE_SCORE_ID",
                isNewScore: true,
            },
            {
                scoreID: "SCORE_ID_1",
                isNewScore: true,
            },
            {
                scoreID: "SCORE_ID_2",
                isNewScore: true,
            },
            {
                scoreID: "SCORE_ID_3",
                isNewScore: true,
            },
        ]);

        t.equal(sessions[0].timeEnded, start + 2000);

        t.end();
    });

    t.test("Should change the timeStarted of existing sessions if prepending.", async (t) => {
        await db.sessions.insert({
            sessionID: "EXAMPLE_SESSION_ID",
            userID: 1,
            game: "iidx",
            playtype: "SP",
            importType: "ir/direct-manual",
            timeStarted: start,
            timeEnded: start,
            scoreInfo: [
                {
                    scoreID: "EXAMPLE_SCORE_ID",
                    isNewScore: true,
                },
            ],
        } as SessionDocument);

        const res = await LoadScoresIntoSessions(
            1,
            "ir/direct-manual",
            [null, start, start - 1000, start - 2000].map((e, i) =>
                deepmerge(TestingIIDXSPScore, { timeAchieved: e, scoreID: `SCORE_ID_${i}` })
            ) as ScoreDocument[],
            "iidx",
            "SP",
            logger
        );

        t.strictSame(res, [
            {
                sessionID: "EXAMPLE_SESSION_ID",
                type: "Appended",
            },
        ]);

        const sessions = await db.sessions.find({ game: "iidx", playtype: "SP", userID: 1 });

        t.equal(sessions.length, 1);

        t.strictSame(sessions[0].scoreInfo, [
            {
                scoreID: "EXAMPLE_SCORE_ID",
                isNewScore: true,
            },
            {
                scoreID: "SCORE_ID_3",
                isNewScore: true,
            },
            {
                scoreID: "SCORE_ID_2",
                isNewScore: true,
            },
            {
                scoreID: "SCORE_ID_1",
                isNewScore: true,
            },
        ]);

        t.equal(sessions[0].timeStarted, start - 2000);

        t.end();
    });

    t.test("Should calculate pbDifferences if a scorePB exists.", async (t) => {
        await db["personal-bests"].insert(TestingIIDXSPScorePB);

        const res = await LoadScoresIntoSessions(
            1,
            "ir/direct-manual",
            [TestingIIDXSPScore],
            "iidx",
            "SP",
            logger
        );

        t.match(res, [
            {
                sessionID: /^Q[a-f0-9]{40}$/u,
                type: "Created",
            },
        ]);

        const sessions = await db.sessions.find({ game: "iidx", playtype: "SP", userID: 1 });

        t.equal(sessions.length, 1);

        t.strictSame(sessions[0].scoreInfo, [
            {
                scoreID: "TESTING_SCORE_ID",
                isNewScore: false,
                gradeDelta: 4,
                lampDelta: -2,
                percentDelta: -44.08396946564885,
                scoreDelta: -693,
            },
        ]);

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
