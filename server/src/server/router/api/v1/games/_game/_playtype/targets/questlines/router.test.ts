import dm from "deepmerge";
import db from "external/mongo/db";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { TestingIIDXSPQuest } from "test-utils/test-data";
import type { QuestDocument, QuestlineDocument } from "tachi-common";

const TestingIIDXSPQuestline: QuestlineDocument = {
	name: "Testing Questline",
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

	t.test("Should return all questlines for this game.", async (t) => {
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

		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/questlines");

		t.hasStrict(
			(res.body.body.questlines as Array<QuestlineDocument>).sort((a, b) =>
				a.name.localeCompare(b.name)
			),
			[
				{ questlineID: "radically_different_name" },
				{ questlineID: "similar_name" },
				{ questlineID: "name" },
			]
		);

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

	t.test("Should return the questline and its quests.", async (t) => {
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

	t.test("Should return 404 if the questline doesn't exist.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/questlines/foobar");

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.end();
});
