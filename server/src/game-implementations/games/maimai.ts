import {
	GoalFmtPercent,
	GoalOutOfFmtPercent,
	GradeGoalFormatter,
} from "./_common";
import db from "external/mongo/db";
import { CreatePBMergeFor } from "game-implementations/utils/pb-merge";
import { ProfileAvgBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { MaimaiRate } from "rg-stats";
import { GetGrade, MAIMAI_GBOUNDARIES } from "tachi-common";
import { IsNullish } from "utils/misc";
import type { GPTServerImplementation } from "game-implementations/types";
import type {
	ExtractedClasses,
	Game,
	integer,
	Playtype,
	UserGameStatsSnapshotDocument,
} from "tachi-common";
import { FindOneResult } from "monk";

const DAN_BONUSES: Record<ExtractedClasses["maimai:Single"]["dan"], number> = {
	"DAN_1": 0.2,
	"DAN_2": 0.4,
	"DAN_3": 0.55,
	"DAN_4": 0.7,
	"DAN_5": 0.85,
	"DAN_6": 0.95,
	"DAN_7": 1.05,
	"DAN_8": 1.15,
	"DAN_9": 1.25,
	"DAN_10": 1.35,
	"KAIDEN": 1.65,

	"SHINDAN_1": 1.70,
	"SHINDAN_2": 1.75,
	"SHINDAN_3": 1.80,
	"SHINDAN_4": 1.85,
	"SHINDAN_5": 1.90,
	"SHINDAN_6": 1.95,
	"SHINDAN_7": 1.98,
	"SHINDAN_8": 2.01,
	"SHINDAN_9": 2.04,
	"SHINDAN_10": 2.07,
	"SHINKAIDEN": 2.10,
};

// maimai rating is composed of three components: BEST, RECENT, HISTORY
// The BEST and RECENT components consist of N best **songs**, that is,
// each song can only be in the BEST or RECENT component once.
//
// For example, if a player has a 99% on PANDORA PARADOXX Re:MASTER and
// a 100% on PANDORA PARADOXX MASTER, only the MASTER score will be counted
// since it is higher rated.
//
// There is also a dan bonus, up to 2.10 for Shinkaidan.
//
// This does not take into account the RECENT component.
async function CalculateMaimaiRate(
	game: Game,
	playtype: Playtype,
	userID: integer,
) {
	const user = await db["game-stats-snapshots"].findOne(
		{
			userID,
			game,
			playtype,
			"classes.dan": { $exists: true },
		},
		{
			projection: {
				"classes.dan": 1,
			},
		},
	) as FindOneResult<UserGameStatsSnapshotDocument<"maimai:Single">>;

	const danBonus = user?.classes?.dan ? DAN_BONUSES[user.classes.dan] : 0;

	const songs: Array<{ _id: integer; rate: number }> =
		await db["personal-bests"].aggregate([
			{
				$match: {
					game,
					playtype,
					userID,
					"calculatedData.rate": { $type: "number" },
				},
			},
			{
				$group: {
					_id: "$songID",
					rate: { $max: "$calculatedData.rate" },
				},
			},
			{
				$sort: {
					rate: -1,
				},
			},
			{
				$limit: 570,
			},
		]);

	if (typeof songs === "undefined" || songs.length === 0) {
		return null;
	}

	const best30 = songs.slice(0, 30).reduce((acc, cur) => acc + cur.rate, 0);
	const history570 = best30 +
		songs.slice(30).reduce((acc, cur) => acc + cur.rate, 0);

	return (best30 + history570 * 4 / 570) / 44 + danBonus;
}

export const MAIMAI_IMPL: GPTServerImplementation<"maimai:Single"> = {
	chartSpecificValidators: {
		percent: (percent, chart) => {
			if (percent < 0) {
				return `Percent must be non-negative. Got ${percent}.`;
			}
			
			if (percent > chart.data.maxPercent) {
				return `Percent (${percent}) is greater than max percent (${chart.data.maxPercent}).`;
			}

			return true;
		}
	},
	derivers: {
		grade: ({ percent }) => GetGrade(MAIMAI_GBOUNDARIES, percent),
	},
	scoreCalcs: {
		rate: (scoreData, chart) =>
			MaimaiRate.calculate(
				scoreData.percent,
				chart.data.maxPercent,
				chart.levelNum,
			),
	},
	sessionCalcs: { rate: SessionAvgBest10For("rate") },
	profileCalcs: {
		naiveRate: CalculateMaimaiRate,
	},
	classDerivers: {
		colour: (ratings) => {
			const rate = ratings.naiveRate;

			if (IsNullish(rate)) {
				return null;
			}

			if (rate >= 15) {
				return "RAINBOW";
			} else if (rate >= 14.5) {
				return "GOLD";
			} else if (rate >= 14) {
				return "SILVER";
			} else if (rate >= 13) {
				return "BRONZE";
			} else if (rate >= 12) {
				return "PURPLE";
			} else if (rate >= 10) {
				return "RED";
			} else if (rate >= 7) {
				return "YELLOW";
			} else if (rate >= 4) {
				return "GREEN";
			} else if (rate >= 2) {
				return "BLUE";
			}

			return "WHITE";
		},
	},
	goalCriteriaFormatters: {
		percent: GoalFmtPercent,
	},
	goalProgressFormatters: {
		percent: (pb) => `${pb.scoreData.percent.toFixed(2)}%`,
		lamp: (pb) => pb.scoreData.lamp,
		grade: (pb, gradeIndex) =>
			GradeGoalFormatter(
				MAIMAI_GBOUNDARIES,
				pb.scoreData.grade,
				pb.scoreData.percent,
				MAIMAI_GBOUNDARIES[gradeIndex]!.name,
				(v) => `${v.toFixed(2)}%`,
			),
	},
	goalOutOfFormatters: {
		percent: GoalOutOfFmtPercent,
	},
	pbMergeFunctions: [
		CreatePBMergeFor(
			"largest",
			"enumIndexes.lamp",
			"Best Lamp",
			(base, score) => {
				base.scoreData.lamp = score.scoreData.lamp;
			},
		),
	],
	defaultMergeRefName: "Best Percent",
	scoreValidators: [
		(s) => {
			if (s.scoreData.percent > 104) {
				return "Score cannot be greater than 104%.";
			}
		},
		(s) => {
			let { great, good, miss, perfect } = s.scoreData.judgements;

			perfect ??= 0;
			great ??= 0;
			good ??= 0;
			miss ??= 0;

			if (s.scoreData.lamp === "ALL PERFECT") {
				if (great + good + miss > 0) {
					return "Cannot have an ALL PERFECT with any non-jcrit judgements.";
				}
			}

			if (s.scoreData.lamp === "FULL COMBO") {
				if (miss > 0) {
					return "Cannot have a FULL COMBO if the score has misses.";
				}
			}
		},
	],
};
