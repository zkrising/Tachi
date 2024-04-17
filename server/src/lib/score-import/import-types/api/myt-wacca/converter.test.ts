import ConvertAPIMytWACCA from "./converter";
import deepmerge from "deepmerge";
import CreateLogCtx from "lib/logger/logger";
import { ParseDateFromString } from "lib/score-import/framework/common/score-utils";
import {
	WaccaMusicDifficulty,
	WaccaMusicScoreGrade,
	WaccaPlayMode,
} from "proto/generated/wacca/common_pb";
import t from "tap";
import ResetDBState from "test-utils/resets";
import { TestingWaccaPupaExp, TestingWaccaPupaSong } from "test-utils/test-data";
import type { MytWaccaScore } from "./types";

const logger = CreateLogCtx(__filename);

const parsedScore: MytWaccaScore = {
	musicId: 2085,
	musicDifficulty: WaccaMusicDifficulty.WACCA_MUSIC_DIFFICULTY_EXPERT,
	score: 996827,
	grade: WaccaMusicScoreGrade.WACCA_MUSIC_SCORE_GRADE_SSS_PLUS,
	judge: {
		marvelous: 909,
		great: 4,
		good: 1,
		miss: 1,
	},
	clearStatus: {
		isClear: true,
		isMissless: true,
		isFullCombo: false,
		isAllMarvelous: false,
		isGiveUp: false,
	},
	isNewRecord: false,
	combo: 408,
	skillPoints: 0,
	fast: 4,
	late: 1,
	userPlayMode: WaccaPlayMode.WACCA_PLAY_MODE_SINGLE,
	track: 1,
	userPlayDate: "2024-03-23T19:34:10.350+00:00",
};

t.test("#ConvertAPIMytWACCA", (t) => {
	t.beforeEach(ResetDBState);

	function conv(g: Partial<MytWaccaScore> = {}) {
		return ConvertAPIMytWACCA(deepmerge(parsedScore, g), {}, "api/myt-wacca", logger);
	}

	t.test("Should return a dryScore on valid input.", async (t) => {
		const res = await conv();

		t.strictSame(res, {
			song: TestingWaccaPupaSong,
			chart: TestingWaccaPupaExp,
			dryScore: {
				service: "MYT",
				game: "wacca",
				scoreMeta: {},
				timeAchieved: ParseDateFromString("2024-03-23 19:34:10.350 UTC"),
				comment: null,
				importType: "api/myt-wacca",
				scoreData: {
					score: 996827,
					lamp: "MISSLESS",
					judgements: {
						marvelous: 909,
						great: 4,
						good: 1,
						miss: 1,
					},
					optional: {
						fast: 4,
						slow: 1,
						maxCombo: 408,
					},
				},
			},
		});

		t.end();
	});

	t.test("Should reject unspecified difficulty", (t) => {
		t.rejects(
			() =>
				conv({ musicDifficulty: WaccaMusicDifficulty.WACCA_MUSIC_DIFFICULTY_UNSPECIFIED }),
			{
				message: /Can't process a score with unspecified difficulty/u,
			}
		);

		t.end();
	});

	t.test("Should reject unspecified clear status", (t) => {
		t.rejects(() => conv({ clearStatus: undefined }), {
			message: /Can't process a score without clearStatus/u,
		});

		t.end();
	});

	t.test("Should throw on missing song", (t) => {
		t.rejects(() => conv({ musicId: 999999 }), {
			message: /Can't find chart with id 999999 and difficulty EXPERT/u,
		});

		t.end();
	});

	t.end();
});
