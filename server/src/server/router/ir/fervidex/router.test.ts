import t from "tap";
import db from "external/mongo/db";
import { CloseAllConnections } from "test-utils/close-connections";
import { InsertFakeTokenWithAllPerms } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { GetKTDataJSON } from "test-utils/test-data";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TestHeaders(url: string, data: any) {
	t.test("Should reject invalid X-Software-Models", async (t) => {
		let res = await mockApi
			.post(url)
			.set("Authorization", "Bearer mock_token")
			// rootage
			.set("X-Software-Model", "LDJ:J:B:A:2019090200")
			.set("User-Agent", "fervidex/1.3.0")
			.send(data);

		t.equal(res.body.success, false, "Should reject rootage clients");

		res = await mockApi
			.post(url)
			.set("Authorization", "Bearer mock_token")
			// rootage old
			.set("X-Software-Model", "LDJ:J:B:A:2019100700")
			.set("User-Agent", "fervidex/1.3.0")
			.send(data);

		t.equal(res.body.success, false, "Should reject rootage clients");

		res = await mockApi
			.post(url)
			.set("Authorization", "Bearer mock_token")
			// cannonballers
			.set("User-Agent", "fervidex/1.3.0")
			.set("X-Software-Model", "LDJ:J:B:A:2018091900")
			.send(data);

		t.equal(res.body.success, false, "Should reject cannonballers clients");

		res = await mockApi
			.post(url)
			.set("Authorization", "Bearer mock_token")
			.set("User-Agent", "fervidex/1.3.0")
			.set("X-Software-Model", "LDJ:J:B:A:NONSENSE")
			.send(data);

		t.equal(res.body.success, false, "Should reject nonsense versions");

		res = await mockApi
			.post(url)
			.set("Authorization", "Bearer mock_token")
			// BMS-iidx
			.set("User-Agent", "fervidex/1.3.0")
			.set("X-Software-Model", "LDJ:J:B:Z:2020092900")
			.send(data);

		t.equal(res.body.success, false, "Should reject BMS-iidx clients");

		res = await mockApi
			.post(url)
			.set("Authorization", "Bearer mock_token")
			// BMS-iidx
			.set("User-Agent", "fervidex/1.2.0")
			.set("X-Software-Model", "LDJ:J:B:A:2020092900")
			.send(data);

		t.equal(res.body.success, false, "Should reject outdated fervidex clients");

		res = await mockApi
			.post(url)
			.set("Authorization", "Bearer mock_token")
			// BMS-iidx
			.set("User-Agent", "fervidex/.0")
			.set("X-Software-Model", "LDJ:J:B:A:2020092900")
			.send(data);

		t.equal(res.body.success, false, "Should reject invalid fervidex clients");

		res = await mockApi
			.post(url)
			.set("Authorization", "Bearer mock_token")
			// BMS-iidx
			.set("User-Agent", "")
			.set("X-Software-Model", "LDJ:J:B:A:2020092900")
			.send(data);

		t.equal(res.body.success, false, "Should reject invalid fervidex clients");

		res = await mockApi
			.post(url)
			.set("Authorization", "Bearer mock_token")
			// BMS-iidx
			.set("User-Agent", "invalid")
			.set("X-Software-Model", "LDJ:J:B:A:2020092900")
			.send(data);

		t.equal(res.body.success, false, "Should reject invalid fervidex clients");

		t.end();
	});
}

t.test("POST /ir/fervidex/class/submit", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(InsertFakeTokenWithAllPerms("mock_token"));

	TestHeaders("/ir/fervidex/class/submit", {});

	t.test("Should update a users class.", async (t) => {
		const res = await mockApi
			.post("/ir/fervidex/class/submit")
			.set("Authorization", "Bearer mock_token")
			.set("User-Agent", "fervidex/1.3.0")
			.set("X-Software-Model", "LDJ:J:B:A:2020092900")
			.send({ cleared: true, course_id: 18, play_style: 0 });

		t.equal(res.status, 200);
		t.equal(res.body.success, true);
		t.equal(res.body.description, "Dan changed!");

		const ugs = await db["game-stats"].findOne({ userID: 1, game: "iidx", playtype: "SP" });

		t.equal(ugs?.classes.dan, 18);

		t.end();
	});

	t.test("Should update a users class for DP.", async (t) => {
		const res = await mockApi
			.post("/ir/fervidex/class/submit")
			.set("Authorization", "Bearer mock_token")
			.set("User-Agent", "fervidex/1.3.0")
			.set("X-Software-Model", "LDJ:J:B:A:2020092900")
			.send({ cleared: true, course_id: 17, play_style: 1 });

		t.equal(res.status, 200);
		t.equal(res.body.success, true);
		t.equal(res.body.description, "Dan changed!");

		const ugs = await db["game-stats"].findOne({ userID: 1, game: "iidx", playtype: "DP" });

		t.equal(ugs?.classes.dan, 17);

		t.end();
	});

	t.test("Should ignore dans that weren't cleared.", async (t) => {
		const res = await mockApi
			.post("/ir/fervidex/class/submit")
			.set("Authorization", "Bearer mock_token")
			.set("User-Agent", "fervidex/1.3.0")
			.set("X-Software-Model", "LDJ:J:B:A:2020092900")
			.send({ cleared: false, course_id: 17, play_style: 1 });

		t.equal(res.status, 200);
		t.equal(res.body.description, "No Update Made.");

		t.end();
	});

	t.test("Should reject invalid dans.", async (t) => {
		const res = await mockApi
			.post("/ir/fervidex/class/submit")
			.set("Authorization", "Bearer mock_token")
			.set("User-Agent", "fervidex/1.3.0")
			.set("X-Software-Model", "LDJ:J:B:A:2020092900")
			.send({ cleared: true, course_id: null, play_style: 1 });

		t.equal(res.status, 400);
		t.match(res.body.description, /Invalid course_id/u);

		t.end();
	});

	t.test("Should reject invalid numerical dans.", async (t) => {
		const res = await mockApi
			.post("/ir/fervidex/class/submit")
			.set("Authorization", "Bearer mock_token")
			.set("User-Agent", "fervidex/1.3.0")
			.set("X-Software-Model", "LDJ:J:B:A:2020092900")
			.send({ cleared: true, course_id: 20, play_style: 1 });

		t.equal(res.status, 400);
		t.match(res.body.description, /Invalid course_id 20/u);

		t.end();
	});

	t.test("Should reject invalid negative dans.", async (t) => {
		const res = await mockApi
			.post("/ir/fervidex/class/submit")
			.set("Authorization", "Bearer mock_token")
			.set("User-Agent", "fervidex/1.3.0")
			.set("X-Software-Model", "LDJ:J:B:A:2020092900")
			.send({ cleared: true, course_id: -1, play_style: 1 });

		t.equal(res.status, 400);
		t.match(res.body.description, /Invalid course_id -1/u);

		t.end();
	});

	t.test("Should reject invalid play_styles.", async (t) => {
		const res = await mockApi
			.post("/ir/fervidex/class/submit")
			.set("Authorization", "Bearer mock_token")
			.set("User-Agent", "fervidex/1.3.0")
			.set("X-Software-Model", "LDJ:J:B:A:2020092900")
			.send({ cleared: true, course_id: 16, play_style: null });

		t.equal(res.status, 400);
		t.match(res.body.description, /Invalid play_style/u);

		t.end();
	});

	t.end();
});

t.test("POST /ir/fervidex/score/submit", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(InsertFakeTokenWithAllPerms("mock_token"));

	TestHeaders("/ir/fervidex/score/submit", GetKTDataJSON("./fervidex/base.json"));

	t.test("Should import a valid score", async (t) => {
		const res = await mockApi
			.post("/ir/fervidex/score/submit")
			.set("Authorization", "Bearer mock_token")
			.set("User-Agent", "fervidex/1.3.0")
			.set("X-Software-Model", "LDJ:J:B:A:2020092900")
			.send(GetKTDataJSON("./fervidex/base.json"));

		t.equal(res.body.success, true, "Should be successful");

		t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

		const scores = await db.scores.count({
			service: "Fervidex",
		});

		t.equal(scores, 1, "Should import 1 score.");

		t.end();
	});

	t.test("Should import a valid score with 2dx-gsm", async (t) => {
		const res = await mockApi
			.post("/ir/fervidex/score/submit")
			.set("Authorization", "Bearer mock_token")
			.set("User-Agent", "fervidex/1.3.0")
			.set("X-Software-Model", "LDJ:J:B:A:2020092900")
			.send(GetKTDataJSON("./fervidex/2dxgsm.json"));

		t.equal(res.body.success, true, "Should be successful");

		t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

		const scores = await db.scores.count({
			service: "Fervidex",
		});

		t.equal(scores, 1, "Should import 1 score.");

		t.end();
	});

	t.test("Should reject an invalid body", async (t) => {
		const res = await mockApi
			.post("/ir/fervidex/score/submit")
			.set("User-Agent", "fervidex/1.3.0")
			.set("Authorization", "Bearer mock_token")
			.send({});

		t.equal(res.body.success, false, "Should not be successful");

		t.end();
	});

	t.end();
});

t.test("POST /ir/fervidex/profile/submit", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(InsertFakeTokenWithAllPerms("mock_token"));

	TestHeaders("/ir/fervidex/class/submit", GetKTDataJSON("./fervidex-static/base.json"));

	const ferStaticBody = GetKTDataJSON("./fervidex-static/base.json");

	t.test("Should accept a fervidex-static body", async (t) => {
		await db.songs.iidx.remove({});
		await db.songs.iidx.insert(GetKTDataJSON("./tachi/tachi-songs-iidx.json"));
		await db.charts.iidx.remove({});
		await db.charts.iidx.insert(GetKTDataJSON("./tachi/tachi-charts-iidx.json"));

		const res = await mockApi
			.post("/ir/fervidex/profile/submit")
			.set("Authorization", "Bearer mock_token")
			.set("User-Agent", "fervidex/1.3.0")
			.set("X-Software-Model", "P2D:J:B:A:2020092900")
			.send(ferStaticBody);

		t.equal(res.body.success, true, "Should be successful");

		t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

		t.strictSame(
			res.body.body.classDeltas,
			[
				{
					set: "dan",
					playtype: "SP",
					old: null,
					new: 15,
				},
			],
			"Should return updated dan deltas."
		);

		const scores = await db.scores.count({
			service: "Fervidex Static",
		});

		t.equal(scores, 3, "Should import 3 scores.");

		const ugs = await db["game-stats"].findOne({
			userID: 1,
			game: "iidx",
			playtype: "SP",
		});

		t.equal(ugs!.classes.dan, 15, "Should successfully update dan to 9th.");

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
