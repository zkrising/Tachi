import t from "tap";
import db from "external/mongo/db";
import ResetDBState from "test-utils/resets";
import { GetKTDataJSON } from "test-utils/test-data";
import { TachiPBScoreToBeatorajaFormat } from "./convert-scores";
import { ScoreDocument, PBScoreDocument } from "tachi-common";
import { Random20Hex } from "utils/misc";
import deepmerge from "deepmerge";

const gazerChart = GetKTDataJSON("./tachi/bms-gazer-chart.json");

const pbScore = {
	composedFrom: {
		lampPB: "mock_lampPB",
	},
	scoreData: {
		lampIndex: 4,
		score: 1234,
		hitMeta: {},
	},
	playtype: "7K",
	scoreMeta: {},
	chartID: gazerChart.chartID,
	userID: 1,
} as unknown as PBScoreDocument<"bms:7K" | "bms:14K">;

t.test("#TachiPBScoreToBeatorajaFormat", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await db.scores.insert(
			[1, 2, 3, 4, 5].map(() => ({
				userID: 1,
				chartID: gazerChart.chartID,
				scoreID: Random20Hex(),
			})) as ScoreDocument[]
		);

		await db.scores.insert({
			scoreID: "mock_lampPB",
			scoreData: {
				hitMeta: {},
			},
			scoreMeta: {
				inputDevice: "KEYBOARD",
			},
		} as ScoreDocument);
	});

	t.test("Should convert score.", async (t) => {
		const res = await TachiPBScoreToBeatorajaFormat(pbScore, gazerChart, 1);

		t.strictSame(
			res,
			{
				sha256: "195fe1be5c3e74fccd04dc426e05f8a9cfa8a1059c339d0a23e99f63661f0b7d",
				player: "",
				playcount: 5,
				clear: 5,
				date: 0,
				maxcombo: 0,
				deviceType: "KEYBOARD",
				gauge: 0,
				random: 0,
				passnotes: 0,
				minbp: 0,
				notes: 2256,
			},
			"Should return the beatoraja score format."
		);

		t.end();
	});

	t.test("Should emplace username if requestingUserID is not the pbscore owner", async (t) => {
		const res = await TachiPBScoreToBeatorajaFormat(pbScore, gazerChart, 2);

		t.strictSame(
			res,
			{
				sha256: "195fe1be5c3e74fccd04dc426e05f8a9cfa8a1059c339d0a23e99f63661f0b7d",
				player: "test_zkldi",
				playcount: 5,
				clear: 5,
				date: 0,
				maxcombo: 0,
				deviceType: "KEYBOARD",
				gauge: 0,
				random: 0,
				passnotes: 0,
				minbp: 0,
				notes: 2256,
			},
			"Should return the beatoraja score format."
		);

		t.end();
	});

	t.test("Should return random if one is present", async (t) => {
		await db.scores.remove({ scoreID: "mock_lampPB" });
		await db.scores.insert({
			scoreID: "mock_lampPB",
			scoreData: {
				hitMeta: {},
			},
			scoreMeta: {
				inputDevice: "KEYBOARD",
				random: "RANDOM",
			},
		} as ScoreDocument);

		const res = await TachiPBScoreToBeatorajaFormat(pbScore, gazerChart, 2);

		t.strictSame(
			res,
			{
				sha256: "195fe1be5c3e74fccd04dc426e05f8a9cfa8a1059c339d0a23e99f63661f0b7d",
				player: "test_zkldi",
				playcount: 5,
				clear: 5,
				date: 0,
				maxcombo: 0,
				deviceType: "KEYBOARD",
				gauge: 0,
				random: 2,
				passnotes: 0,
				minbp: 0,
				notes: 2256,
			},
			"Should return the beatoraja score format."
		);

		t.end();
	});

	t.test("Should skip random if score is 14K", async (t) => {
		await db.scores.remove({ scoreID: "mock_lampPB" });
		await db.scores.insert({
			scoreID: "mock_lampPB",
			scoreData: {
				hitMeta: {},
			},
			scoreMeta: {
				inputDevice: "KEYBOARD",
				random: "RANDOM",
			},
		} as ScoreDocument);

		const res = await TachiPBScoreToBeatorajaFormat(
			deepmerge(pbScore, { playtype: "14K" }),
			gazerChart,
			2
		);

		t.strictSame(
			res,
			{
				sha256: "195fe1be5c3e74fccd04dc426e05f8a9cfa8a1059c339d0a23e99f63661f0b7d",
				player: "test_zkldi",
				playcount: 5,
				clear: 5,
				date: 0,
				maxcombo: 0,
				deviceType: "KEYBOARD",
				gauge: 0,
				random: 0,
				passnotes: 0,
				minbp: 0,
				notes: 2256,
			},
			"Should return the beatoraja score format."
		);

		t.end();
	});

	t.test("Should throw severe if no lampPB exists.", async (t) => {
		await db.scores.remove({ scoreID: "mock_lampPB" });

		t.rejects(() => TachiPBScoreToBeatorajaFormat(pbScore, gazerChart, 2), {
			message: /User 1's PB on.*has no lampPB/u,
		});

		t.end();
	});

	t.end();
});
