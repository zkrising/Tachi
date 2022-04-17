import db from "external/mongo/db";
import t from "tap";
import ResetDBState from "test-utils/resets";
import { TestingIIDXSPMilestone } from "test-utils/test-data";
import dm from "deepmerge";
import { MilestoneDocument, MilestoneSetDocument } from "tachi-common";
import mockApi from "test-utils/mock-api";

const TestingIIDXSPMilestoneSet: MilestoneSetDocument = {
	name: "Testing Milestone Set",
	desc: "foo",
	game: "iidx",
	milestones: [TestingIIDXSPMilestone.milestoneID, "other_milestone"],
	playtype: "SP",
	setID: "milestone_set",
};

t.test("GET /api/v1/games/:game/:playtype/targets/milestone-sets", (t) => {
	t.beforeEach(ResetDBState);

	function mkSet(merge: any) {
		return dm(TestingIIDXSPMilestoneSet, merge) as MilestoneSetDocument;
	}

	t.test("Should search the loaded milestone sets for this game.", async (t) => {
		await db["milestone-sets"].insert([
			mkSet({ name: "Testing Set", setID: "name" }),
			mkSet({ name: "Testing Other Set", setID: "similar_name" }),
			mkSet({ name: "Different Name", setID: "radically_different_name" }),
			mkSet({
				game: "chunithm",
				playtype: "Single",
				setID: "matching name but different gpt",
			}),
			mkSet({ playtype: "DP", setID: "matching name but different playtype" }),
		]);

		const res = await mockApi.get(
			"/api/v1/games/iidx/SP/targets/milestone-sets?search=Testing"
		);

		t.hasStrict(
			(res.body.body as MilestoneSetDocument[]).sort((a, b) => a.name.localeCompare(b.name)),
			[{ setID: "similar_name" }, { setID: "name" }]
		);

		t.end();
	});

	t.test("Should mandate a search field.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/milestone-sets");

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/games/:game/:playtype/targets/milestone-sets/:setID", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await db["milestone-sets"].insert(TestingIIDXSPMilestoneSet);
		await db.milestones.insert([
			TestingIIDXSPMilestone,
			dm(TestingIIDXSPMilestone, { milestoneID: "other_milestone" }) as MilestoneDocument,
		]);
	});

	t.test("Should return the milestone set and its milestones.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/milestone-sets/milestone_set");

		t.equal(res.statusCode, 200, "Should return 200.");

		t.hasStrict(res.body.body.milestoneSet, {
			setID: TestingIIDXSPMilestoneSet.setID,
		});

		t.hasStrict(
			(res.body.body.milestones as MilestoneDocument[]).sort((a, b) =>
				a.milestoneID.localeCompare(b.milestoneID)
			),
			[
				{ milestoneID: TestingIIDXSPMilestone.milestoneID },
				{ milestoneID: "other_milestone" },
			]
		);

		t.end();
	});

	t.test("Should return 404 if the milestone set doesn't exist.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/milestone-sets/foobar");

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.end();
});
