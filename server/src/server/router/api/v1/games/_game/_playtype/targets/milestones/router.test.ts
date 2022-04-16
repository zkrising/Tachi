import { MilestoneDocument, MilestoneSubscriptionDocument } from "tachi-common";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import dm from "deepmerge";
import {
	FakeOtherUser,
	TestingIIDXSPMilestone,
	TestingIIDXSPMilestoneSub,
} from "test-utils/test-data";
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

// this is my lazy sample data for these tests.
const LoadLazySampleData = async () => {
	await db.users.insert(FakeOtherUser);
	await db.milestones.insert([
		TestingIIDXSPMilestone,
		dm(TestingIIDXSPMilestone, { milestoneID: "other_milestone" }) as MilestoneDocument,
	]);
	await db["milestone-subs"].insert([
		TestingIIDXSPMilestoneSub,
		dm(TestingIIDXSPMilestoneSub, { milestoneID: "other_milestone" }),
		dm(TestingIIDXSPMilestoneSub, {
			userID: 2,
		}),
	] as MilestoneSubscriptionDocument[]);
};

t.test("GET /api/v1/games/:game/:playtype/targets/milestones/popular", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadLazySampleData);

	t.test("Should return the most subscribed milestones for this GPT.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/milestones/popular");

		t.equal(res.statusCode, 200);

		t.hasStrict(
			(res.body.body as MilestoneDocument[]).sort((a, b) => a.name.localeCompare(b.name)),
			[
				{ milestoneID: TestingIIDXSPMilestone.milestoneID, __subscriptions: 2 },
				{ milestoneID: "other_milestone", __subscriptions: 1 },
			]
		);

		t.end();
	});

	t.end();
});
