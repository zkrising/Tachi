import dm from "deepmerge";
import db from "external/mongo/db";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { TestingIIDXSPQuest } from "test-utils/test-data";
import type { QuestDocument, QuestlineDocument } from "tachi-common";

const TestingIIDXSPQuestline: QuestlineDocument = {
	name: "Testing Quest Set",
	desc: "foo",
	game: "iidx",
	quests: [TestingIIDXSPQuest.questID, "other_quest"],
	playtype: "SP",
	questlineID: "quest_set",
};

t.test("GET /api/v1/games/:game/:playtype/targets/questlines", (t) => {
	t.beforeEach(ResetDBState);

	function mkSet(merge: any) {
		return dm(TestingIIDXSPQuestline, merge) as QuestlineDocument;
	}

	t.test("Should search the loaded quest sets for this game.", async (t) => {
		await db.questlines.insert([
			mkSet({ name: "Testing Set", questlineID: "name" }),
			mkSet({ name: "Testing Other Set", questlineID: "similar_name" }),
			mkSet({ name: "Different Name", questlineID: "radically_different_name" }),
			mkSet({
				game: "chunithm",
				playtype: "Single",
				questlineID: "matching name but different gpt",
			}),
			mkSet({ playtype: "DP", questlineID: "matching name but different playtype" }),
		]);

		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/questlines?search=Testing");

		t.hasStrict(
			(res.body.body as Array<QuestlineDocument>).sort((a, b) =>
				a.name.localeCompare(b.name)
			),
			[{ questlineID: "similar_name" }, { questlineID: "name" }]
		);

		t.end();
	});

	t.test("Should mandate a search field.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/questlines");

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/games/:game/:playtype/targets/questlines/:questlineID", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await db.questlines.insert(TestingIIDXSPQuestline);
		await db.quests.insert([
			TestingIIDXSPQuest,
			dm(TestingIIDXSPQuest, { questID: "other_quest" }) as QuestDocument,
		]);
	});

	t.test("Should return the quest set and its quests.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/questlines/quest_set");

		t.equal(res.statusCode, 200, "Should return 200.");

		t.hasStrict(res.body.body.questline, {
			questlineID: TestingIIDXSPQuestline.questlineID,
		});

		t.hasStrict(
			(res.body.body.quests as Array<QuestDocument>).sort((a, b) =>
				a.questID.localeCompare(b.questID)
			),
			[{ questID: TestingIIDXSPQuest.questID }, { questID: "other_quest" }]
		);

		t.end();
	});

	t.test("Should return 404 if the quest set doesn't exist.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/questlines/foobar");

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.end();
});
