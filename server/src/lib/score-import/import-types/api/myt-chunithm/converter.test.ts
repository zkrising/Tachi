import ConvertAPIMytChunithm from "./converter";
import CreateLogCtx from "lib/logger/logger";
import { ParseDateFromString } from "lib/score-import/framework/common/score-utils";
import {
	ChunithmLevel,
	ChunithmClearStatus,
	ChunithmComboStatus,
	ChunithmScoreRank,
	ChunithmFullChainStatus,
} from "proto/generated/chunithm/common_pb";
import t from "tap";
import { dmf } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { TestingChunithmChartConverter, TestingChunithmSongConverter } from "test-utils/test-data";
import type { MytChunithmScore } from "./types";

const logger = CreateLogCtx(__filename);

const parsedScore: MytChunithmScore = {
	playlogApiId: "346907fc-ba1a-4ff9-a5a3-37a62b5f2e6c",
	info: {
		musicId: 956,
		level: ChunithmLevel.CHUNITHM_LEVEL_MASTER,
		score: 1001715,
		scoreRank: ChunithmScoreRank.CHUNITHM_SCORE_RANK_SS,
		comboStatus: ChunithmComboStatus.CHUNITHM_COMBO_STATUS_NONE,
		fullChainStatus: ChunithmFullChainStatus.CHUNITHM_FULL_CHAIN_STATUS_NONE,
		clearStatus: ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_CLEAR,
		track: 2,
		isNewRecord: false,
		userPlayDate: "2024-02-05T00:00:00.000Z",
	},
	judge: {
		judgeHeaven: 300,
		judgeCritical: 1159,
		judgeJustice: 37,
		judgeAttack: 4,
		judgeMiss: 10,
		maxCombo: 493,
	},
};

t.test("#ConvertAPIMytChunithm", (t) => {
	t.beforeEach(ResetDBState);

	function convert(modifier: any = {}) {
		return ConvertAPIMytChunithm(dmf(parsedScore, modifier), {}, "api/myt-chunithm", logger);
	}

	t.test("Should return a dryScore on valid input.", async (t) => {
		const res = await convert();

		t.strictSame(res, {
			song: TestingChunithmSongConverter,
			chart: TestingChunithmChartConverter,
			dryScore: {
				service: "MYT",
				game: "chunithm",
				scoreMeta: {},
				timeAchieved: ParseDateFromString("2024-02-05T00:00:00.000Z"),
				comment: null,
				importType: "api/myt-chunithm",
				scoreData: {
					score: 1001715,
					clearLamp: "CLEAR",
					comboLamp: "NONE",
					judgements: {
						jcrit: 1459,
						justice: 37,
						attack: 4,
						miss: 10,
					},
					optional: {
						maxCombo: 493,
					},
				},
			},
		});
		t.end();
	});

	t.test("Should reject WORLD'S END charts", (t) => {
		t.rejects(
			() =>
				convert({
					info: {
						musicId: 8032,
						level: ChunithmLevel.CHUNITHM_LEVEL_WORLDS_END,
					},
				}),
			{
				message: /WORLD'S END charts are not supported/u,
			}
		);
		t.end();
	});

	t.test("Should reject unspecified difficulty", (t) => {
		t.rejects(
			() =>
				convert({
					info: {
						level: ChunithmLevel.CHUNITHM_LEVEL_UNSPECIFIED,
					},
				}),
			{
				message: /Can't process a score with unspecified difficulty/u,
			}
		);
		t.end();
	});

	t.test("note lamp", async (t) => {
		t.hasStrict(
			await convert({
				info: {
					comboStatus: ChunithmComboStatus.CHUNITHM_COMBO_STATUS_ALL_JUSTICE_CRITICAL,
					clearStatus: ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_FAILED,
				},
			}),
			{
				dryScore: { scoreData: { comboLamp: "ALL JUSTICE CRITICAL", clearLamp: "FAILED" } },
			}
		);
		t.hasStrict(
			await convert({
				info: {
					comboStatus: ChunithmComboStatus.CHUNITHM_COMBO_STATUS_ALL_JUSTICE,
					clearStatus: ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_FAILED,
				},
			}),
			{
				dryScore: { scoreData: { comboLamp: "ALL JUSTICE", clearLamp: "FAILED" } },
			}
		);
		t.hasStrict(
			await convert({
				info: {
					comboStatus: ChunithmComboStatus.CHUNITHM_COMBO_STATUS_FULL_COMBO,
					clearStatus: ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_FAILED,
				},
			}),
			{
				dryScore: { scoreData: { comboLamp: "FULL COMBO", clearLamp: "FAILED" } },
			}
		);
		t.hasStrict(
			await convert({
				info: {
					comboStatus: ChunithmComboStatus.CHUNITHM_COMBO_STATUS_NONE,
					clearStatus: ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_HARD,
				},
			}),
			{
				dryScore: { scoreData: { comboLamp: "NONE", clearLamp: "HARD" } },
			}
		);
		t.hasStrict(
			await convert({
				info: {
					comboStatus: ChunithmComboStatus.CHUNITHM_COMBO_STATUS_NONE,
					clearStatus: ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_ABSOLUTE,
				},
			}),
			{
				dryScore: { scoreData: { comboLamp: "NONE", clearLamp: "BRAVE" } },
			}
		);
		t.hasStrict(
			await convert({
				info: {
					comboStatus: ChunithmComboStatus.CHUNITHM_COMBO_STATUS_NONE,
					clearStatus: ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_ABSOLUTE_PLUS,
				},
			}),
			{
				dryScore: { scoreData: { comboLamp: "NONE", clearLamp: "ABSOLUTE" } },
			}
		);
		t.hasStrict(
			await convert({
				info: {
					comboStatus: ChunithmComboStatus.CHUNITHM_COMBO_STATUS_NONE,
					clearStatus: ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_CATASTROPHY,
				},
			}),
			{
				dryScore: { scoreData: { comboLamp: "NONE", clearLamp: "CATASTROPHY" } },
			}
		);
		t.hasStrict(
			await convert({
				info: {
					comboStatus: ChunithmComboStatus.CHUNITHM_COMBO_STATUS_NONE,
					clearStatus: ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_CLEAR,
				},
			}),
			{
				dryScore: { scoreData: { comboLamp: "NONE", clearLamp: "CLEAR" } },
			}
		);
		t.hasStrict(
			await convert({
				info: {
					comboStatus: ChunithmComboStatus.CHUNITHM_COMBO_STATUS_NONE,
					clearStatus: ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_FAILED,
				},
			}),
			{
				dryScore: { scoreData: { comboLamp: "NONE", clearLamp: "FAILED" } },
			}
		);
		t.end();
	});

	t.test("Should reject unspecified clear status", (t) => {
		t.rejects(
			() =>
				convert({
					info: {
						clearStatus: ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_UNSPECIFIED,
					},
				}),
			{
				message: /Can't process a score with an invalid clear status/u,
			}
		);
		t.end();
	});

	t.test("Should reject unspecified combo status", (t) => {
		t.rejects(
			() =>
				convert({
					info: {
						comboStatus: ChunithmComboStatus.CHUNITHM_COMBO_STATUS_UNSPECIFIED,
					},
				}),
			{
				message: /Can't process a score with an invalid combo status/u,
			}
		);
		t.end();
	});

	t.test("Should throw on missing chart", (t) => {
		t.rejects(() => convert({ info: { musicId: 999999 } }), {
			message: /Can't find chart with id 999999 and difficulty MASTER/u,
		});
		t.end();
	});

	t.end();
});
