import deepmerge from "deepmerge";
import db from "external/mongo/db";
import { PublicUserDocument } from "tachi-common";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { GetKTDataJSON } from "test-utils/test-data";

t.test("POST /ir/beatoraja/submit-score", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(() =>
		db["api-tokens"].insert({
			userID: 1,
			identifier: "Mock API Beatoraja Token",
			permissions: {
				submit_score: true,
			},
			token: "mock_token",
			fromAPIClient: null,
		})
	);

	const bmsScoreReq = GetKTDataJSON("./beatoraja/base.json");
	const pmsScoreReq = GetKTDataJSON("./beatoraja/pms-base.json");

	t.test("Should import a valid BMS score.", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-score")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(bmsScoreReq);

		t.equal(res.status, 200);

		t.equal(res.body.success, true);
		t.hasStrict(res.body.body, {
			score: {
				game: "bms",
				scoreData: {
					score: 1004,
				},
				importType: "ir/beatoraja",
			},
			chart: {
				chartID: "88eb6cc5683e2740cbd07f588a5f3db1db8d467b",
			},
			song: {
				id: 27339,
			},
		});

		const score = await db.scores.findOne(
			{ scoreID: res.body.body.score.scoreID },
			{ projection: { _id: 0 } }
		);

		t.not(score, null);

		t.hasStrict(res.body.body.score, score);
		t.hasStrict(res.body.body.score, score);

		t.end();
	});

	t.test("Should import a valid PMS score.", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-score")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(pmsScoreReq);

		t.equal(res.status, 200);

		t.equal(res.body.success, true);
		t.hasStrict(res.body.body, {
			score: {
				game: "pms",
				playtype: "Controller",
				scoreData: {
					score: 1004,
				},
				importType: "ir/beatoraja",
			},
			chart: {
				chartID: "0446f1b54e90d631ff9fe98419ebaea9481fab1f",
			},
			song: {
				id: 1,
			},
		});

		const score = await db.scores.findOne(
			{ scoreID: res.body.body.score.scoreID },
			{ projection: { _id: 0 } }
		);

		t.not(score, null);

		t.hasStrict(res.body.body.score, score);

		t.end();
	});

	t.test("Should infer playtype from the PMS score.", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-score")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(deepmerge(pmsScoreReq, { score: { deviceType: "KEYBOARD" } }));

		t.equal(res.status, 200);

		t.equal(res.body.success, true);
		t.hasStrict(res.body.body, {
			score: {
				game: "pms",
				playtype: "Keyboard",
				scoreData: {
					score: 1004,
				},
				importType: "ir/beatoraja",
			},
			chart: {
				chartID: "ca553d77cbf8b3e9e7709dad6123ffed1695a1dd",
			},
			song: {
				id: 1,
			},
		});

		const score = await db.scores.findOne(
			{ scoreID: res.body.body.score.scoreID },
			{ projection: { _id: 0 } }
		);

		t.not(score, null);

		t.hasStrict(res.body.body.score, score);

		t.end();
	});

	t.test("Should return an error if invalid client.", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-score")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(deepmerge(bmsScoreReq, { client: "INVALID" }));

		t.equal(res.status, 400);

		t.equal(res.body.success, false);
		t.match(res.body.description, /Unsupported client/u);

		t.end();
	});

	t.test("Should return an error if BMS scores try to use beatoraja.", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-score")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(deepmerge(bmsScoreReq, { client: "beatoraja 0.8.0" }));

		t.equal(res.status, 400);

		t.equal(res.body.success, false);
		t.match(res.body.description, /Unsupported client/u);

		t.end();
	});

	t.test("Should return an error if PMS scores try to use lr2oraja.", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-score")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(deepmerge(pmsScoreReq, { client: "LR2oraja 0.8.0" }));

		t.equal(res.status, 400);

		t.equal(res.body.success, false);
		t.match(res.body.description, /Unsupported client/u);

		t.end();
	});

	t.test("Should return an error if invalid score.", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-score")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(deepmerge(bmsScoreReq, { score: { exscore: -1 } }));

		t.equal(res.status, 400);

		t.equal(res.body.success, false);
		t.match(res.body.description, /Invalid Beatoraja Import - Score/u);

		t.end();
	});

	t.test("Should return an error if invalid chart.", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-score")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(deepmerge(bmsScoreReq, { chart: { title: null } }));

		t.equal(res.status, 400);

		t.equal(res.body.success, false);
		t.match(res.body.description, /Invalid Beatoraja Import - Chart/u);

		t.end();
	});

	t.test("Should defer a chart to the orphan queue if not found.", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-score")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(
				deepmerge(bmsScoreReq, {
					chart: { sha256: "new_chart", md5: "new_md5" },
					score: { sha256: "new_chart", md5: "new_md5" },
				})
			);

		t.equal(res.status, 202);

		t.equal(res.body.success, true);
		t.match(res.body.description, /Chart and score have been orphaned/u);

		const orphanChart = await db["orphan-chart-queue"].findOne({
			"chartDoc.data.hashSHA256": "new_chart",
		});

		t.hasStrict(orphanChart?.chartDoc, {
			data: {
				hashSHA256: "new_chart",
				hashMD5: "new_md5",
			},
		});

		t.end();
	});

	t.test("Should eventually unorphan a chart.", async (t) => {
		await db["api-tokens"].insert([
			{
				userID: 2,
				identifier: "token2",
				permissions: { submit_score: true },
				token: "token2",
				fromAPIClient: null,
			},
			{
				userID: 3,
				identifier: "token3",
				permissions: { submit_score: true },
				token: "token3",
				fromAPIClient: null,
			},
		]);

		await db.users.insert([
			{
				id: 2,
				username: "foo",
				usernameLowercase: "foo",
			},
			{
				id: 3,
				username: "bar",
				usernameLowercase: "bar",
			},
		] as PublicUserDocument[]);

		const res = await mockApi
			.post("/ir/beatoraja/submit-score")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(
				deepmerge(bmsScoreReq, {
					chart: { sha256: "new_chart", md5: "new_md5" },
					score: { sha256: "new_chart", md5: "new_md5" },
				})
			);

		t.equal(res.statusCode, 202);

		const res2 = await mockApi
			.post("/ir/beatoraja/submit-score")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer token2")
			.send(
				deepmerge(bmsScoreReq, {
					chart: { sha256: "new_chart", md5: "new_md5" },
					score: { sha256: "new_chart", md5: "new_md5" },
				})
			);

		t.equal(res2.statusCode, 202);

		const orphanData = await db["orphan-chart-queue"].findOne({
			"chartDoc.data.hashSHA256": "new_chart",
		});

		t.strictSame(orphanData?.userIDs, [1, 2]);

		const res3 = await mockApi
			.post("/ir/beatoraja/submit-score")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer token3")
			.send(
				deepmerge(bmsScoreReq, {
					chart: { sha256: "new_chart", md5: "new_md5" },
					score: { sha256: "new_chart", md5: "new_md5" },
				})
			);

		t.equal(res3.statusCode, 200);

		const orphanData2 = await db["orphan-chart-queue"].findOne({
			"chartDoc.data.hashSHA256": "new_chart",
		});

		t.equal(orphanData2, null, "Orphan data should be removed from the database.");

		const score = await db.scores.findOne({
			game: "bms",
			userID: 3,
		});

		t.hasStrict(score, {
			scoreData: {
				score: 1004,
			},
			importType: "ir/beatoraja",
		});

		t.end();
	});

	t.test("Should require authentication.", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-score")
			.set("X-TachiIR-Version", "v2.0.0")
			.send(bmsScoreReq);

		t.equal(res.status, 401);

		t.end();
	});

	t.test("Should reject non-corresponding tokens.", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-score")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer invalid_token")

			.send(bmsScoreReq);

		t.equal(res.status, 401);

		t.end();
	});

	t.end();
});

const courseScore = {
	course: {
		name: "GENOSIDE 2018 段位認定 発狂皆伝",
		charts: [
			{
				md5: "cfad3baadce9e02c45021963453d7c94",
			},
			{
				md5: "77d23be22b2370925c573d922276bce0",
			},
			{
				md5: "188a99f74ab71804f2e360dcf484545c",
			},
			{
				md5: "c46a81cb184f5a804c119930d6eba748",
			},
		],
		constraint: ["MIRROR", "GAUGE_LR2", "LN"],
		trophy: [{}, {}],
		lntype: 0,
	},
	score: {
		sha256: "",
		lntype: 0,
		player: "unknown",
		clear: "Clear",
		date: 0,
		epg: 1334,
		lpg: 788,
		egr: 1634,
		lgr: 382,
		egd: 239,
		lgd: 142,
		ebd: 34,
		lbd: 8,
		epr: 0,
		lpr: 93,
		ems: 63,
		lms: 74,
		maxcombo: 225,
		notes: 6005,
		passnotes: 4654,
		minbp: 1623,
		option: 0,
		assist: 0,
		gauge: 0,
		deviceType: "BM_CONTROLLER",
		judgeAlgorithm: "Combo",
		rule: "Beatoraja_7",
		exscore: 6260,
	},
};

t.test("POST /ir/beatoraja/submit-course", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(() =>
		db["api-tokens"].insert({
			userID: 1,
			identifier: "Mock API Beatoraja Token",
			permissions: {
				submit_score: true,
			},
			token: "mock_token",
			fromAPIClient: null,
		})
	);

	t.test("Should accept a valid clear", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-course")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(courseScore);

		t.equal(res.status, 200);
		t.equal(res.body.success, true);
		t.equal(res.body.description, "Successfully updated class.");

		const ugs = await db["game-stats"].findOne({ userID: 1, game: "bms", playtype: "7K" });

		t.equal(ugs?.classes.genocideDan, 22, "Should set their dan to insane kaiden.");

		t.end();
	});

	t.test("Should silently reject a fail", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-course")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(deepmerge(courseScore, { score: { clear: "Failed" } }));

		t.equal(res.status, 200);
		t.equal(res.body.success, true);
		t.equal(res.body.description, "Class not updated.");

		t.end();
	});

	t.test("Should reject scores with no charts", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-course")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(deepmerge(courseScore, { course: { charts: [] } }, { arrayMerge: (d, s) => s }));

		t.equal(res.status, 400);
		t.equal(res.body.success, false);
		t.equal(res.body.description, "Invalid Course Submission.");

		t.end();
	});

	t.test("Should reject scores with invalid chart documents", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-course")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(deepmerge(courseScore, { course: { charts: [1, 2, 3, 4] } }));

		t.equal(res.status, 400);
		t.equal(res.body.success, false);
		t.equal(res.body.description, "Invalid Course Submission.");

		t.end();
	});

	t.test("Should reject scores with too many chart documents", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-course")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(
				deepmerge(courseScore, {
					course: { charts: [{ md5: "a" }, { md5: "a" }, { md5: "a" }, { md5: "a" }] },
				})
			);

		t.equal(res.status, 400);
		t.equal(res.body.success, false);
		t.equal(res.body.description, "Invalid Course Submission.");

		t.end();
	});

	t.test("Should reject scores not on LN mode", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-course")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(
				deepmerge(courseScore, {
					score: {
						lntype: 1,
					},
				})
			);

		t.equal(res.status, 400);
		t.equal(res.body.success, false);
		t.equal(res.body.description, "LN mode is the only supported mode for dans.");

		t.end();
	});

	t.test("Should reject too few constraints", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-course")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(
				deepmerge(
					courseScore,
					{
						course: {
							constraint: ["GAUGE_LR2"],
						},
					},
					{ arrayMerge: (d, s) => s }
				)
			);

		t.equal(res.status, 400);
		t.equal(res.body.success, false);
		t.equal(res.body.description, "Invalid Constraints.");

		t.end();
	});

	t.test("Should reject non-array constraints", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-course")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(
				deepmerge(
					courseScore,
					{
						course: {
							constraint: "foo",
						},
					},
					{ arrayMerge: (d, s) => s }
				)
			);

		t.equal(res.status, 400);
		t.equal(res.body.success, false);
		t.equal(res.body.description, "Invalid Constraints.");

		t.end();
	});

	t.test("Should reject too many constraints", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-course")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(
				deepmerge(
					courseScore,
					{
						course: {
							constraint: ["a", "b", "c", "d"],
						},
					},
					{ arrayMerge: (d, s) => s }
				)
			);

		t.equal(res.status, 400);
		t.equal(res.body.success, false);
		t.equal(res.body.description, "Invalid Constraints.");

		t.end();
	});

	t.test("Should reject invalid constraints", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-course")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(
				deepmerge(
					courseScore,
					{
						course: {
							constraint: ["foo", "bar"],
						},
					},
					{ arrayMerge: (d, s) => s }
				)
			);

		t.equal(res.status, 400);
		t.equal(res.body.success, false);
		t.equal(res.body.description, "Invalid Constraints.");

		t.end();
	});

	t.test("Should reject invalid constraints for 3", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-course")
			.set("X-TachiIR-Version", "v2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(
				deepmerge(
					courseScore,
					{
						course: {
							constraint: ["GAUGE_LR2", "MIRROR", "CHEAT_MODE"],
						},
					},
					{ arrayMerge: (d, s) => s }
				)
			);

		t.equal(res.status, 400);
		t.equal(res.body.success, false);
		t.equal(res.body.description, "Invalid Constraints.");

		t.end();
	});

	t.end();
});
