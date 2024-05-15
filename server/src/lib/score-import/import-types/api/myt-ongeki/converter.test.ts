import ConvertAPIMytOngeki from "./converter";
import CreateLogCtx from "lib/logger/logger";
import { ParseDateFromString } from "lib/score-import/framework/common/score-utils";
import {
	OngekiBattleScoreRank,
	OngekiClearStatus,
	OngekiComboStatus,
	OngekiLevel,
	OngekiTechScoreRank,
} from "proto/generated/ongeki/common_pb";
import t from "tap";
import { dmf } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { TestingOngekiChartConverter, TestingOngekiSongConverter } from "test-utils/test-data";
import type { MytOngekiScore } from "./types";

const logger = CreateLogCtx(__filename);

const parsedScore: MytOngekiScore = {
	playlogApiId: "806ca7ac-76f5-4d99-8760-770df60e1ff5",
	info: {
		musicId: 678,
		level: OngekiLevel.ONGEKI_LEVEL_MASTER,
		techScore: 1003385,
		battleScore: 4987905,
		overDamage: 13151,
		techScoreRank: OngekiTechScoreRank.ONGEKI_TECH_SCORE_RANK_SS_PLUS,
		battleScoreRank: OngekiBattleScoreRank.ONGEKI_BATTLE_SCORE_RANK_GREAT,
		comboStatus: OngekiComboStatus.ONGEKI_COMBO_STATUS_NONE,
		clearStatus: OngekiClearStatus.ONGEKI_CLEAR_STATUS_OVER_DAMAGE,
		isFullBell: true,
		isTechNewRecord: true,
		isBattleNewRecord: true,
		isOverDamageNewRecord: true,
		platinumScore: 893,
		userPlayDate: "2022-09-28T12:04:21.400Z",
	},
	judge: {
		judgeCriticalBreak: 967,
		judgeBreak: 19,
		judgeHit: 0,
		judgeMiss: 5,
		maxCombo: 525,
		bellCount: 174,
		totalBellCount: 174,
		damageCount: 0,
	},
};

t.test("#ConvertAPIMytOngeki", (t) => {
	t.beforeEach(ResetDBState);

	function convert(modifier: any = {}) {
		return ConvertAPIMytOngeki(dmf(parsedScore, modifier), {}, "api/myt-ongeki", logger);
	}

	t.test("Should return a dryScore on valid input.", async (t) => {
		const res = await convert();

		t.strictSame(res, {
			song: TestingOngekiSongConverter,
			chart: TestingOngekiChartConverter,
			dryScore: {
				service: "MYT",
				game: "ongeki",
				scoreMeta: {},
				timeAchieved: ParseDateFromString("2022-09-28T12:04:21.400Z"),
				comment: null,
				importType: "api/myt-ongeki",
				scoreData: {
					score: 1003385,
					noteLamp: "CLEAR",
					bellLamp: "FULL BELL",
					judgements: {
						cbreak: 967,
						break: 19,
						hit: 0,
						miss: 5,
					},
					optional: {
						damage: 0,
						bellCount: 174,
						totalBellCount: 174,
						platScore: 893,
					},
				},
			},
		});
		t.end();
	});

	t.test("Should reject unspecified difficulty", (t) => {
		t.rejects(
			() =>
				convert({
					info: {
						level: OngekiLevel.ONGEKI_LEVEL_UNSPECIFIED,
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
					comboStatus: OngekiComboStatus.ONGEKI_COMBO_STATUS_ALL_BREAK,
					clearStatus: OngekiClearStatus.ONGEKI_CLEAR_STATUS_FAILED,
				},
			}),
			{
				dryScore: { scoreData: { noteLamp: "ALL BREAK" } },
			}
		);
		t.hasStrict(
			await convert({
				info: {
					comboStatus: OngekiComboStatus.ONGEKI_COMBO_STATUS_FULL_COMBO,
					clearStatus: OngekiClearStatus.ONGEKI_CLEAR_STATUS_FAILED,
				},
			}),
			{
				dryScore: { scoreData: { noteLamp: "FULL COMBO" } },
			}
		);
		t.hasStrict(
			await convert({
				info: {
					comboStatus: OngekiComboStatus.ONGEKI_COMBO_STATUS_NONE,
					clearStatus: OngekiClearStatus.ONGEKI_CLEAR_STATUS_OVER_DAMAGE,
				},
			}),
			{
				dryScore: { scoreData: { noteLamp: "CLEAR" } },
			}
		);
		t.hasStrict(
			await convert({
				info: {
					comboStatus: OngekiComboStatus.ONGEKI_COMBO_STATUS_NONE,
					clearStatus: OngekiClearStatus.ONGEKI_CLEAR_STATUS_CLEARED,
				},
			}),
			{
				dryScore: { scoreData: { noteLamp: "CLEAR" } },
			}
		);
		t.hasStrict(
			await convert({
				info: {
					comboStatus: OngekiComboStatus.ONGEKI_COMBO_STATUS_NONE,
					clearStatus: OngekiClearStatus.ONGEKI_CLEAR_STATUS_FAILED,
				},
			}),
			{
				dryScore: { scoreData: { noteLamp: "LOSS" } },
			}
		);
		t.end();
	});

	t.test("platinum score should be null if value is 0", async (t) => {
		t.hasStrict(
			await convert({
				info: {
					platinumScore: 0,
				},
			}),
			{
				dryScore: { scoreData: { optional: { platScore: null } } },
			}
		);
		t.end();
	});

	t.test("Should reject unspecified clear status", (t) => {
		t.rejects(
			() =>
				convert({
					info: {
						clearStatus: OngekiClearStatus.ONGEKI_CLEAR_STATUS_UNSPECIFIED,
					},
				}),
			{
				message: /Can't process a score with an invalid combo status and\/or clear status/u,
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
