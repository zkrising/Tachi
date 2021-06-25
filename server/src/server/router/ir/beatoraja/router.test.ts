import t from "tap";
import db from "../../../../external/mongo/db";
import { CloseAllConnections } from "../../../../test-utils/close-connections";
import mockApi from "../../../../test-utils/mock-api";
import ResetDBState from "../../../../test-utils/resets";
import { GetKTDataJSON } from "../../../../test-utils/test-data";
import deepmerge from "deepmerge";

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
		})
	);

	const scoreReq = GetKTDataJSON("./beatoraja/base.json");

	t.test("Should import a valid score.", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-score")
			.set("X-BokutachiIR-Version", "2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(scoreReq);

		t.equal(res.status, 200);

		t.equal(res.body.success, true);
		t.hasStrict(res.body.body, {
			score: {
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

		t.end();
	});

	t.test("Should return an error if invalid client.", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-score")
			.set("X-BokutachiIR-Version", "2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(deepmerge(scoreReq, { client: "INVALID" }));

		t.equal(res.status, 400);

		t.equal(res.body.success, false);
		t.match(res.body.description, /Unknown client/u);

		t.end();
	});

	t.test("Should return an error if invalid score.", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-score")
			.set("X-BokutachiIR-Version", "2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(deepmerge(scoreReq, { score: { exscore: -1 } }));

		t.equal(res.status, 400);

		t.equal(res.body.success, false);
		t.match(res.body.description, /Invalid Beatoraja Import - Score/u);

		t.end();
	});

	t.test("Should return an error if invalid chart.", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-score")
			.set("X-BokutachiIR-Version", "2.0.0")
			.set("Authorization", "Bearer mock_token")
			.send(deepmerge(scoreReq, { chart: { title: null } }));

		t.equal(res.status, 400);

		t.equal(res.body.success, false);
		t.match(res.body.description, /Invalid Beatoraja Import - Chart/u);

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
		})
	);

	t.test("Should accept a valid clear", async (t) => {
		const res = await mockApi
			.post("/ir/beatoraja/submit-course")
			.set("X-BokutachiIR-Version", "2.0.0")
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
			.set("X-BokutachiIR-Version", "2.0.0")
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
			.set("X-BokutachiIR-Version", "2.0.0")
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
			.set("X-BokutachiIR-Version", "2.0.0")
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
			.set("X-BokutachiIR-Version", "2.0.0")
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
			.set("X-BokutachiIR-Version", "2.0.0")
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
			.set("X-BokutachiIR-Version", "2.0.0")
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
			.set("X-BokutachiIR-Version", "2.0.0")
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
			.set("X-BokutachiIR-Version", "2.0.0")
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
			.set("X-BokutachiIR-Version", "2.0.0")
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
			.set("X-BokutachiIR-Version", "2.0.0")
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

t.teardown(CloseAllConnections);
