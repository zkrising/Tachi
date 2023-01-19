import { CreateSessions, LoadScoresIntoSessions } from "./sessions";
import { CreateScoreLogger } from "../common/import-logger";
import deepmerge from "deepmerge";
import db from "external/mongo/db";
import t from "tap";
import ResetDBState from "test-utils/resets";
import { TestingIIDXSPScore, TestingIIDXSPScorePB } from "test-utils/test-data";
import type { ScoreDocument, SessionDocument, UserDocument } from "tachi-common";

const logger = CreateScoreLogger(
	{ username: "test_zkldi", id: 1 } as UserDocument,
	"foo",
	"ir/direct-manual"
);

t.test("#CreateSessions", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(() => db.sessions.remove({}));

	t.test("Should compose sessions from one timestamped score provided.", async (t) => {
		const res = await CreateSessions(1, "iidx", { SP: [TestingIIDXSPScore] }, logger);

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
			// name: "adjective1 adjective2 noun1",
			sessionID: res[0]?.sessionID,
			desc: null,
			game: "iidx",
			playtype: "SP",
			highlight: false,
			scoreIDs: ["TESTING_SCORE_ID"],

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
			[null, start, start + 1000, start + 2000, start + 3000].map((e, i) =>
				deepmerge(TestingIIDXSPScore, { timeAchieved: e, scoreID: `SCORE_ID_${i}` })
			) as Array<ScoreDocument>,
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

		t.strictSame(sessions[0]?.scoreIDs, [
			"SCORE_ID_1",
			"SCORE_ID_2",
			"SCORE_ID_3",
			"SCORE_ID_4",
		]);

		t.end();
	});

	t.test("Should sort scores before creating sessions.", async (t) => {
		const res = await LoadScoresIntoSessions(
			1,
			[null, start, start - 4000, start + 2000, start - 3000, null, start + 1000].map(
				(e, i) =>
					deepmerge(TestingIIDXSPScore, { timeAchieved: e, scoreID: `SCORE_ID_${i}` })
			) as Array<ScoreDocument>,
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

		t.strictSame(sessions[0]?.scoreIDs, [
			"SCORE_ID_2",
			"SCORE_ID_4",
			"SCORE_ID_1",
			"SCORE_ID_6",
			"SCORE_ID_3",
		]);

		t.end();
	});

	const TWO_HOURS = 1000 * 60 * 60 * 2;

	t.test("Should create multiple sessions if scores are far apart.", async (t) => {
		const res = await LoadScoresIntoSessions(
			1,
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
			) as Array<ScoreDocument>,
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

		t.strictSame(sessions[0]?.scoreIDs, ["SCORE_ID_1", "SCORE_ID_2", "SCORE_ID_3"]);
		t.strictSame(sessions[1]?.scoreIDs, ["SCORE_ID_4", "SCORE_ID_5", "SCORE_ID_6"]);

		t.end();
	});

	t.test("Should append to existing sessions.", async (t) => {
		await db.sessions.insert({
			sessionID: "EXAMPLE_SESSION_ID",
			userID: 1,
			game: "iidx",
			playtype: "SP",
			timeStarted: start,
			timeEnded: start,
			scoreIDs: ["EXAMPLE_SCORE_ID"],
		} as SessionDocument);

		const res = await LoadScoresIntoSessions(
			1,
			[null, start, start + 1000, start + 2000].map((e, i) =>
				deepmerge(TestingIIDXSPScore, { timeAchieved: e, scoreID: `SCORE_ID_${i}` })
			) as Array<ScoreDocument>,
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

		t.strictSame(sessions[0]?.scoreIDs, [
			"EXAMPLE_SCORE_ID",
			"SCORE_ID_1",
			"SCORE_ID_2",
			"SCORE_ID_3",
		]);

		t.equal(sessions[0]?.timeEnded, start + 2000);

		t.end();
	});

	t.test("Should change the timeStarted of existing sessions if prepending.", async (t) => {
		await db.sessions.insert({
			sessionID: "EXAMPLE_SESSION_ID",
			userID: 1,
			game: "iidx",
			playtype: "SP",
			timeStarted: start,
			timeEnded: start,
			scoreIDs: ["EXAMPLE_SCORE_ID"],
		} as SessionDocument);

		const res = await LoadScoresIntoSessions(
			1,
			[null, start, start - 1000, start - 2000].map((e, i) =>
				deepmerge(TestingIIDXSPScore, { timeAchieved: e, scoreID: `SCORE_ID_${i}` })
			) as Array<ScoreDocument>,
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

		t.strictSame(sessions[0]?.scoreIDs, [
			"EXAMPLE_SCORE_ID",
			"SCORE_ID_3",
			"SCORE_ID_2",
			"SCORE_ID_1",
		]);

		t.equal(sessions[0]?.timeStarted, start - 2000);

		t.end();
	});

	t.test("Should calculate pbDifferences if a scorePB exists.", async (t) => {
		await db["personal-bests"].insert(TestingIIDXSPScorePB);

		const res = await LoadScoresIntoSessions(1, [TestingIIDXSPScore], "iidx", "SP", logger);

		t.match(res, [
			{
				sessionID: /^Q[a-f0-9]{40}$/u,
				type: "Created",
			},
		]);

		const sessions = await db.sessions.find({ game: "iidx", playtype: "SP", userID: 1 });

		t.equal(sessions.length, 1);

		t.strictSame(sessions[0]?.scoreIDs, ["TESTING_SCORE_ID"]);

		t.end();
	});

	t.end();
});
