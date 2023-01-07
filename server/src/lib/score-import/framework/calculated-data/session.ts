import { GetGPTString } from "tachi-common";
import type { GPTSessionCalculators, SessionCalculator } from "./types";
import type { GPTString, Game, Playtype, ScoreDocument, integer } from "tachi-common";

function AverageBestN(vals: Array<number | null | undefined>, n = 10) {
	const numbers = vals.filter((e) => typeof e === "number") as Array<number>;

	if (numbers.length < n) {
		return null;
	}

	return (
		numbers
			.sort((a, b) => b - a)
			.slice(0, n)
			.reduce((a, e) => a + e, 0) / n
	);
}

function AvgBest10For<GPT extends GPTString>(
	prop: keyof ScoreDocument<GPT>["calculatedData"]
): SessionCalculator<GPT> {
	return (arr) =>
		AverageBestN(
			arr.map((e) => e[prop]),
			10
		);
}

function AvgBestNFor<GPT extends GPTString>(
	prop: keyof ScoreDocument<GPT>["calculatedData"],
	n: integer
): SessionCalculator<GPT> {
	return (arr) =>
		AverageBestN(
			arr.map((e) => e[prop]),
			n
		);
}

export const SESSION_CALCULATORS: GPTSessionCalculators = {
	"iidx:SP": {
		BPI: AvgBest10For("BPI"),
		ktLampRating: AvgBest10For("ktLampRating"),
	},
	"iidx:DP": {
		BPI: AvgBest10For("BPI"),
		ktLampRating: AvgBest10For("ktLampRating"),
	},

	"bms:14K": { sieglinde: AvgBest10For("sieglinde") },
	"bms:7K": { sieglinde: AvgBest10For("sieglinde") },
	"pms:Controller": { sieglinde: AvgBest10For("sieglinde") },
	"pms:Keyboard": { sieglinde: AvgBest10For("sieglinde") },

	"chunithm:Single": { naiveRating: AvgBest10For("rating") },
	"wacca:Single": { rate: AvgBest10For("rate") },
	"gitadora:Dora": { skill: AvgBest10For("skill") },
	"gitadora:Gita": { skill: AvgBest10For("skill") },

	"itg:Stamina": { blockRating: AvgBestNFor("blockRating", 5) },

	"jubeat:Single": { jubility: AvgBest10For("jubility") },
	"maimaidx:Single": { rate: AvgBest10For("rate") },
	"museca:Single": { curatorSkill: AvgBest10For("curatorSkill") },
	"popn:9B": { classPoints: AvgBest10For("classPoints") },
	"sdvx:Single": {
		ProfileVF6: (arr) => {
			const v = AvgBest10For("VF6")(arr);

			if (v !== null) {
				return v * 50;
			}

			return null;
		},
	},
	"usc:Controller": {
		ProfileVF6: (arr) => {
			const v = AvgBest10For("VF6")(arr);

			if (v !== null) {
				return v * 50;
			}

			return null;
		},
	},
	"usc:Keyboard": {
		ProfileVF6: (arr) => {
			const v = AvgBest10For("VF6")(arr);

			if (v !== null) {
				return v * 50;
			}

			return null;
		},
	},
};

/**
 * Create calculated data for a session of this game and playtype.
 * @param scores - All of the scores in this session.
 */
export function CreateSessionCalcData(
	game: Game,
	playtype: Playtype,
	scores: Array<ScoreDocument>
) {
	const scoreCalculatedData = scores.map((e) => e.calculatedData);

	const gptString = GetGPTString(game, playtype);

	const sessionCalcData: Record<string, number | null> = {};

	for (const [key, fn] of Object.entries(SESSION_CALCULATORS[gptString])) {
		sessionCalcData[key] = fn(scoreCalculatedData);
	}

	return sessionCalcData;
}
