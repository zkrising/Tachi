import { DeleteScore } from "./delete-scores";
import deepmerge from "deepmerge";
import db from "external/mongo/db";
import t from "tap";
import { mkFakeSDVXChart, mkFakeSDVXPB } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { TestingIIDXSPScore, TestingSDVXScore } from "test-utils/test-data";
import type { ImportDocument, ScoreDocument, SessionDocument } from "tachi-common";

const mockImportDocument: ImportDocument = {
	userID: 1,
	userIntent: false,
	classDeltas: [],
	createdSessions: [],
	errors: [],
	goalInfo: [],
	gptStrings: [],
	importID: "mockImportID",
	importType: "file/batch-manual",
	questInfo: [],
	scoreIDs: ["scoreid_1", "scoreid_2"],
	timeFinished: 1000,
	timeStarted: 0,
	game: "iidx",
	playtypes: ["SP"],
};

const mockSessionDocument: SessionDocument = {
	userID: 1,
	calculatedData: {},
	desc: "",
	game: "iidx",
	playtype: "SP",
	highlight: false,
	name: "",
	scoreIDs: ["scoreid_1", "scoreid_2"],
	sessionID: "mockSessionID",
	timeEnded: 1000,
	timeInserted: 0,
	timeStarted: 0,
};

t.test("#DeleteScore", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should delete a score and everything pertaining to it", async (t) => {
		const score = deepmerge<ScoreDocument>(TestingIIDXSPScore, { scoreID: "scoreid_1" });
		const score2 = deepmerge<ScoreDocument>(TestingIIDXSPScore, { scoreID: "scoreid_2" });

		await db.imports.insert(mockImportDocument);
		await db.sessions.insert(mockSessionDocument);

		await db.scores.insert([score, score2]);

		// This function doesn't return anything, instead,
		// we need to check external state.
		await DeleteScore(score);

		const dbScore = await db.scores.findOne({
			scoreID: "scoreid_1",
		});

		t.equal(dbScore, null, "Should remove the score from the database.");

		const dbImport = await db.imports.findOne({
			importID: "mockImportID",
		});

		t.strictSame(
			dbImport?.scoreIDs,
			["scoreid_2"],
			"Should remove scoreid_1 from the importDocuments scoreIDs."
		);

		const dbSession = await db.sessions.findOne({
			sessionID: "mockSessionID",
		});

		t.strictSame(
			dbSession?.scoreIDs,
			["scoreid_2"],
			"Should remove scoreid_1 from the sessionDocument's scoreIDs"
		);

		t.end();
	});

	t.test(
		"Should work (i.e. not crash) if the score has no parent session or import",
		async (t) => {
			const score = deepmerge<ScoreDocument>(TestingIIDXSPScore, { scoreID: "scoreid_1" });

			await db.scores.insert(score);

			// This function doesn't return anything, instead,
			// we need to check external state.

			await DeleteScore(score);

			const dbScore = await db.scores.findOne({ scoreID: score.scoreID });

			t.equal(dbScore, null, "Should be removed from the database.");

			t.end();
		}
	);

	t.test("Should destroy its parents if this killed the only child", async (t) => {
		const score = deepmerge<ScoreDocument>(TestingIIDXSPScore, { scoreID: "scoreid_1" });

		await db.imports.insert(
			deepmerge<ImportDocument>(
				mockImportDocument,
				{ scoreIDs: ["scoreid_1"] },
				{
					arrayMerge: (a, b) => b,
				}
			)
		);
		await db.sessions.insert(
			deepmerge<SessionDocument>(
				mockSessionDocument,
				{
					scoreIDs: ["scoreid_1"],
				},
				{
					arrayMerge: (a, b) => b,
				}
			)
		);

		await db.scores.insert(score);

		await DeleteScore(score);

		const dbScore = await db.scores.findOne({
			scoreID: "scoreid_1",
		});

		t.equal(dbScore, null, "Should remove the score from the database.");

		const dbImport = await db.imports.findOne({
			importID: "mockImportID",
		});

		t.equal(dbImport, null, "Should remove the import from the database.");

		const dbSession = await db.sessions.findOne({
			sessionID: "mockSessionID",
		});

		t.equal(dbSession, null, "Should remove the session from the database.");

		t.end();
	});

	t.test("Should update classes if the user's classes should need to change.", async (t) => {
		await db.charts.sdvx.insert(
			mkFakeSDVXChart("chart_1", {
				difficulty: "EXH",
			})
		);
		await db.charts.sdvx.insert(
			mkFakeSDVXChart("chart_2", {
				difficulty: "NOV",
			})
		);

		const score = deepmerge<ScoreDocument>(TestingSDVXScore, {
			scoreID: "scoreid_1",
			scoreData: { score: 10_000_000 } as ScoreDocument["scoreData"],
			chartID: "chart_1",
			calculatedData: { VF6: 10 },
		});
		const score2 = deepmerge<ScoreDocument>(TestingSDVXScore, {
			scoreID: "scoreid_2",
			scoreData: { score: 9_000_000 } as ScoreDocument["scoreData"],
			chartID: "chart_2",
			calculatedData: { VF6: 4 },
		});

		await db.scores.insert([score, score2]);
		await db["personal-bests"].insert([
			mkFakeSDVXPB({
				chartID: "chart_1",
				calculatedData: {
					VF6: 10,
				},
			}),
			mkFakeSDVXPB({
				chartID: "chart_2",
				calculatedData: {
					VF6: 4,
				},
			}),
		]);

		await db["game-stats"].insert({
			userID: 1,
			game: "sdvx",
			playtype: "Single",
			classes: {
				vfClass: "CYAN_I",
			},
			ratings: {
				VF6: 14,
			},
		});

		await DeleteScore(score);

		const res = await db["game-stats"].findOne({
			userID: 1,
			game: "sdvx",
			playtype: "Single",
		});

		t.hasStrict(res, {
			classes: {
				vfClass: "SIENNA_II",
			},
			ratings: {
				VF6: 4,
			},
		});

		t.end();
	});

	t.end();
});
