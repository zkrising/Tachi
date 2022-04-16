import { MilestoneDocument } from "tachi-common";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import dm from "deepmerge";
import { TestingIIDXSPMilestone } from "test-utils/test-data";
import db from "external/mongo/db";

t.test("GET /api/v1/games/:game/:playtype/targets/milestones", (t) => {
	t.beforeEach(ResetDBState);

	function mkMilestone(merge: any) {
		return dm(TestingIIDXSPMilestone, merge) as MilestoneDocument;
	}

	t.test("Should search milestones.", async (t) => {
		await db.milestones.insert([
			mkMilestone({ name: "Testing Set", milestoneID: "name" }),
			mkMilestone({ name: "Testing Other Set", milestoneID: "similar_name" }),
			mkMilestone({ name: "Different Name", milestoneID: "radically_different_name" }),
			mkMilestone({
				game: "chunithm",
				playtype: "Single",
				milestoneID: "matching name but different gpt",
			}),
			mkMilestone({ playtype: "DP", milestoneID: "matching name but different playtype" }),
		]);

		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/milestones?search=Testing");

		t.equal(res.statusCode, 200);

		t.hasStrict(
			(res.body.body as MilestoneDocument[]).sort((a, b) => a.name.localeCompare(b.name)),
			[{ milestoneID: "similar_name" }, { milestoneID: "name" }]
		);

		t.end();
	});

	t.end();
});
