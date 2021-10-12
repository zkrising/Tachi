import db from "external/mongo/db";
import t from "tap";
import ResetDBState from "test-utils/resets";
import { DeleteScore } from "./delete-scores";
import { ImportDocument, ScoreDocument, SessionDocument } from "tachi-common";
import { TestingIIDXSPScore } from "test-utils/test-data";
import deepmerge from "deepmerge";

const mockImportDocument: ImportDocument = {
	userID: 1,
	userIntent: false,
	classDeltas: [],
	createdSessions: [],
	errors: [],
	goalInfo: [],
	idStrings: [],
	importID: "mockImportID",
	importType: "file/batch-manual",
	milestoneInfo: [],
	scoreIDs: ["scoreid_1", "scoreid_2"],
	timeFinished: 1000,
	timeStarted: 0,
};

const mockSessionDocument: SessionDocument = {
	userID: 1,
	calculatedData: {},
	desc: "",
	game: "iidx",
	playtype: "SP",
	highlight: false,
	importType: "file/batch-manual",
	name: "",
	scoreInfo: [
		{
			isNewScore: true,
			scoreID: "scoreid_1",
		},
		{
			isNewScore: true,
			scoreID: "scoreid_2",
		},
	],
	sessionID: "mockSessionID",
	timeEnded: 1000,
	timeInserted: 0,
	timeStarted: 0,
	views: 0,
};

t.test("#DeleteScore", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should delete a score and everything pertaining to it", async (t) => {
		const score = deepmerge<ScoreDocument>(TestingIIDXSPScore, { scoreID: "scoreid_1" });

		await db.imports.insert(mockImportDocument);
		await db.sessions.insert(mockSessionDocument);

		await db.scores.insert(score);

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
			dbSession?.scoreInfo,
			[
				{
					isNewScore: true,
					scoreID: "scoreid_2",
				},
			],
			"Should remove scoreid_1 from the importDocuments scoreIDs"
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
					scoreInfo: [
						{
							isNewScore: true,
							scoreID: "scoreid_1",
						},
					],
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

	t.end();
});
