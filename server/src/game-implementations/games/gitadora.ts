import { GetGrade, GoalFmtPercent, GoalOutOfFmtPercent, GradeGoalFormatter } from "./_common";
import db from "external/mongo/db";
import { CreatePBMergeFor } from "game-implementations/utils/pb-merge";
import { GetBestRatingOnSongs, ProfileSumBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { GITADORASkill } from "rg-stats";
import { GITADORA_GBOUNDARIES } from "tachi-common";
import { IsNullish } from "utils/misc";
import type { GPTServerImplementation } from "game-implementations/types";
import type { Game, Playtype, integer } from "tachi-common";

async function CalculateGitadoraSkill(game: Game, playtype: Playtype, userID: integer) {
	const hotSongIDs = (
		await db.songs.gitadora.find({ "data.isHot": true }, { projection: { id: 1 } })
	).map((e) => e.id);

	// get it
	const coldSongIDs = (
		await db.songs.gitadora.find({ "data.isHot": false }, { projection: { id: 1 } })
	).map((e) => e.id);

	const [bestHotScores, bestScores] = await Promise.all([
		GetBestRatingOnSongs(hotSongIDs, userID, game, playtype, "skill", 25),
		GetBestRatingOnSongs(coldSongIDs, userID, game, playtype, "skill", 25),
	]);

	if (bestHotScores.length + bestScores.length === 0) {
		return null;
	}

	let skill = 0;

	skill = skill + bestHotScores.reduce((a, e) => a + e.calculatedData.skill!, 0);
	skill = skill + bestScores.reduce((a, e) => a + e.calculatedData.skill!, 0);

	return skill;
}

const GITADORA_IMPL: GPTServerImplementation<"gitadora:Dora" | "gitadora:Gita"> = {
	validators: {},
	derivers: {
		grade: ({ percent }) => GetGrade(GITADORA_GBOUNDARIES, percent),
	},
	scoreCalcs: {
		skill: (scoreData, chart) => GITADORASkill.calculate(scoreData.percent, chart.levelNum),
	},
	sessionCalcs: { skill: SessionAvgBest10For("skill") },
	profileCalcs: { skill: CalculateGitadoraSkill, naiveSkill: ProfileSumBestN("skill", 50) },
	classDerivers: {
		colour: (ratings) => {
			const sk = ratings.skill;

			if (IsNullish(sk)) {
				return null;
			}

			if (sk >= 8500) {
				return "RAINBOW";
			} else if (sk >= 8000) {
				return "GOLD";
			} else if (sk >= 7500) {
				return "SILVER";
			} else if (sk >= 7000) {
				return "BRONZE";
			} else if (sk >= 6500) {
				return "RED_GRD";
			} else if (sk >= 6000) {
				return "RED";
			} else if (sk >= 5500) {
				return "PURPLE_GRD";
			} else if (sk >= 5000) {
				return "PURPLE";
			} else if (sk >= 4500) {
				return "BLUE_GRD";
			} else if (sk >= 4000) {
				return "BLUE";
			} else if (sk >= 3500) {
				return "GREEN_GRD";
			} else if (sk >= 3000) {
				return "GREEN";
			} else if (sk >= 2500) {
				return "YELLOW_GRD";
			} else if (sk >= 2000) {
				return "YELLOW";
			} else if (sk >= 1500) {
				return "ORANGE_GRD";
			} else if (sk >= 1000) {
				return "ORANGE";
			}

			return "WHITE";
		},
	},
	goalCriteriaFormatters: {
		percent: GoalFmtPercent,
	},
	goalProgressFormatters: {
		lamp: (pb) => pb.scoreData.lamp,
		percent: (pb) => `${pb.scoreData.percent.toFixed(2)}%`,
		grade: (pb, gradeIndex) =>
			GradeGoalFormatter(
				GITADORA_GBOUNDARIES,
				pb.scoreData.grade,
				pb.scoreData.percent,
				GITADORA_GBOUNDARIES[gradeIndex]!.name,
				(v) => `${v.toFixed(2)}%`
			),
	},
	goalOutOfFormatters: {
		percent: GoalOutOfFmtPercent,
	},
	pbMergeFunctions: [
		CreatePBMergeFor("largest", "enumIndexes.lamp", "Best Lamp", (base, score) => {
			base.scoreData.lamp = score.scoreData.lamp;
		}),
	],
	defaultMergeRefName: "Best Percent",
};

export const GITADORA_GITA_IMPL: GPTServerImplementation<"gitadora:Gita"> = GITADORA_IMPL;

export const GITADORA_DORA_IMPL: GPTServerImplementation<"gitadora:Dora"> = GITADORA_IMPL;
