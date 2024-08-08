import ConvertAPIMytMaimaiDx from "./converter";
import CreateLogCtx from "lib/logger/logger";
import { ParseDateFromString } from "lib/score-import/framework/common/score-utils";
import {
  MaimaiComboStatus,
	MaimaiLevel,
  MaimaiScoreRank,
	MaimaiSyncStatus,
} from "proto/generated/maimai/common_pb";
import t from "tap";
import { dmf } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { TestingMaimaiDXChartConverter, TestingMaimaiDXSongConverter } from "test-utils/test-data";
import type { MytMaimaiDxScore } from "./types";

const logger = CreateLogCtx(__filename);

const parsedScore: MytMaimaiDxScore = {
  playlogApiId: "6071c489-6ab9-4674-a443-f88b603fa596",
  info: {
    musicId: 11294,
    level: MaimaiLevel.MAIMAI_LEVEL_EXPERT,
    achievement: 990562,
    deluxscore: 1825,
    scoreRank: MaimaiScoreRank.MAIMAI_SCORE_RANK_SS,
    comboStatus: MaimaiComboStatus.MAIMAI_COMBO_STATUS_NONE,
    syncStatus: MaimaiSyncStatus.MAIMAI_SYNC_STATUS_NONE,
    isClear: true,
    isAchieveNewRecord: true,
    isDeluxscoreNewRecord: true,
    track: 1,
    userPlayDate: "2022-11-03T04:21:05.000+09:00"
  },
  judge: {
    judgeCriticalPerfect: 10,
    judgePerfect: 656,
    judgeGreat: 19,
    judgeGood: 1,
    judgeMiss: 8,
    maxCombo: 279,
    fastCount: 5,
    lateCount: 8
  }
};

t.test("#ConvertAPIMytMaimaiDx", (t) => {
	t.beforeEach(ResetDBState);

	function convert(modifier: any = {}) {
		return ConvertAPIMytMaimaiDx(dmf(parsedScore, modifier), {}, "api/myt-maimaidx", logger);
	}

	t.test("Should return a dryScore on valid input.", async (t) => {
		const res = await convert();

		t.strictSame(res, {
			song: TestingMaimaiDXSongConverter,
			chart: TestingMaimaiDXChartConverter,
			dryScore: {
				service: "MYT",
				game: "maimaidx",
				scoreMeta: {},
				timeAchieved: ParseDateFromString("2022-11-03T04:21:05.000+09:00"),
				comment: null,
				importType: "api/myt-maimaidx",
				scoreData: {
					percent: 99.0562,
					lamp: "CLEAR",
					judgements: {
						pcrit: 10,
						perfect: 656,
						great: 19,
						good: 1,
						miss: 8
					},
					optional: {
						fast: 5,
						slow: 8,
						maxCombo: 279,
					},
				},
			},
		});
		t.end();
	});

	t.test("Should reject Utage charts", (t) => {
		t.rejects(
			() =>
				convert({
					info: {
						musicId: 8032,
						level: MaimaiLevel.MAIMAI_LEVEL_UTAGE,
					},
				}),
			{
				message: /Utage charts are not supported/u,
			}
		);
		t.end();
	});

	t.test("Should reject unspecified difficulty", (t) => {
		t.rejects(
			() =>
				convert({
					info: {
						level: MaimaiLevel.MAIMAI_LEVEL_UNSPECIFIED
					},
				}),
			{
				message: /Can't process a score with unspecified difficulty/u,
			}
		);
		t.end();
	});

	t.test("lamp", async (t) => {
		t.hasStrict(
			await convert({
				info: {
					comboStatus: MaimaiComboStatus.MAIMAI_COMBO_STATUS_ALL_PERFECT_PLUS,
					isClear: true,
				},
			}),
			{
				dryScore: { scoreData: { lamp: "ALL PERFECT+" } },
			}
		);
		t.hasStrict(
			await convert({
				info: {
					comboStatus: MaimaiComboStatus.MAIMAI_COMBO_STATUS_ALL_PERFECT,
					isClear: true,
				},
			}),
			{
				dryScore: { scoreData: { lamp: "ALL PERFECT" } },
			}
		);
		t.hasStrict(
			await convert({
				info: {
					comboStatus: MaimaiComboStatus.MAIMAI_COMBO_STATUS_FULL_COMBO_PLUS,
					isClear: true,
				},
			}),
			{
				dryScore: { scoreData: { lamp: "FULL COMBO+" } },
			}
		);
		t.hasStrict(
			await convert({
				info: {
					comboStatus: MaimaiComboStatus.MAIMAI_COMBO_STATUS_FULL_COMBO,
					isClear: true,
				},
			}),
			{
				dryScore: { scoreData: { lamp: "FULL COMBO" } },
			}
		);
		t.hasStrict(
			await convert({
        info: {
          comboStatus: MaimaiComboStatus.MAIMAI_COMBO_STATUS_NONE,
          isClear: true,
        }
			}),
			{
				dryScore: { scoreData: { lamp: "CLEAR" } },
			}
		);
		t.hasStrict(
			await convert({
				info: {
          comboStatus: MaimaiComboStatus.MAIMAI_COMBO_STATUS_NONE,
          isClear: false,
				},
			}),
			{
				dryScore: { scoreData: { lamp: "FAILED" } },
			}
		);
		t.hasStrict(
			await convert({
				info: {
					comboStatus: MaimaiComboStatus.MAIMAI_COMBO_STATUS_FULL_COMBO,
          isClear: false,
				},
			}),
			{
				dryScore: { scoreData: { lamp: "FAILED" } },
			}
		);
		t.end();
	});

	t.test("Should throw on missing chart", (t) => {
		t.rejects(() => convert({ info: { musicId: 999999, level: MaimaiLevel.MAIMAI_LEVEL_MASTER } }), {
			message: /Can't find chart with id 999999 and difficulty DX Master/u,
		});
		t.end();
	});

	t.end();
});
