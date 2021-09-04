import t from "tap";
import ResetDBState from "test-utils/resets";
import { GetKTDataJSON } from "test-utils/test-data";
import { PBScoreDocument } from "tachi-common";
import { TachiScoreDataToBeatorajaFormat } from "./convert-scores";

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

t.test("#TachiScoreDataToBeatorajaFormat", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should convert score.", (t) => {
		const res = TachiScoreDataToBeatorajaFormat(
			pbScore,
			gazerChart.data.hashSHA256,
			"",
			gazerChart.data.notecount,
			0
		);

		t.strictSame(
			res,
			{
				sha256: "195fe1be5c3e74fccd04dc426e05f8a9cfa8a1059c339d0a23e99f63661f0b7d",
				player: "",
				playcount: 0,
				clear: 5,
				date: 0,
				maxcombo: 0,
				deviceType: null,
				gauge: 0,
				random: null,
				passnotes: 0,
				minbp: 0,
				notes: 2256,
			},
			"Should return the beatoraja score format."
		);

		t.end();
	});

	t.test("Should emplace username if requestingUserID is not the pbscore owner", (t) => {
		const res = TachiScoreDataToBeatorajaFormat(
			pbScore,
			gazerChart.data.hashSHA256,
			"test_zkldi",
			gazerChart.data.notecount,
			0
		);

		t.strictSame(
			res,
			{
				sha256: "195fe1be5c3e74fccd04dc426e05f8a9cfa8a1059c339d0a23e99f63661f0b7d",
				player: "test_zkldi",
				playcount: 0,
				clear: 5,
				date: 0,
				maxcombo: 0,
				deviceType: null,
				gauge: 0,
				random: null,
				passnotes: 0,
				minbp: 0,
				notes: 2256,
			},
			"Should return the beatoraja score format."
		);

		t.end();
	});

	t.end();
});
