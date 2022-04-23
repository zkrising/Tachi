import { Game, Playtype, Playtypes, ScoreDocument, SessionDocument } from "tachi-common";

type ScoreCalculatedDataOnly = Pick<ScoreDocument, "calculatedData">;

const RELEVANT_SCORES = 10;

function AverageBest10(vals: (number | null | undefined)[]) {
	const numbers = vals.filter((e) => typeof e === "number") as number[];

	if (numbers.length < RELEVANT_SCORES) {
		return null;
	}

	return (
		numbers
			.sort((a, b) => b - a)
			.slice(0, RELEVANT_SCORES)
			.reduce((a, e) => a + e, 0) / RELEVANT_SCORES
	);
}

function SumAll(arr: ScoreCalculatedDataOnly[], prop: keyof ScoreDocument["calculatedData"]) {
	return arr.reduce((a, e) => {
		if (typeof e.calculatedData[prop] === "number") {
			return a + (e.calculatedData[prop] as number);
		}

		return a;
	}, 0);
}

function AvgBest10Map(arr: ScoreCalculatedDataOnly[], prop: keyof ScoreDocument["calculatedData"]) {
	return AverageBest10(arr.map((e) => e.calculatedData[prop]));
}

type CalculatedDataFunctions = {
	[G in Game]: {
		[P in Playtypes[G]]: (
			scoreCalcData: ScoreCalculatedDataOnly[]
		) => SessionDocument["calculatedData"];
	};
};

const CalculatedDataFunctions: CalculatedDataFunctions = {
	iidx: {
		SP: (scd) => ({
			BPI: AvgBest10Map(scd, "BPI"),
			ktLampRating: AvgBest10Map(scd, "ktLampRating"),
		}),
		DP: (scd) => ({
			BPI: AvgBest10Map(scd, "BPI"),
			ktLampRating: AvgBest10Map(scd, "ktLampRating"),
		}),
	},
	sdvx: {
		Single: (scd) => {
			const VF6 = AvgBest10Map(scd, "VF6");

			return {
				VF6,
				ProfileVF6: VF6 === null ? null : VF6 * 50,
			};
		},
	},
	popn: {
		"9B": (scd) => ({
			classPoints: AvgBest10Map(scd, "classPoints"),
		}),
	},
	museca: {
		Single: (scd) => ({
			ktRating: AvgBest10Map(scd, "ktRating"),
		}),
	},
	chunithm: {
		Single: (scd) => ({
			naiveRating: AvgBest10Map(scd, "rating"),
		}),
	},
	maimai: {
		Single: () => ({}),
	},
	gitadora: {
		Gita: (scd) => ({
			skill: AvgBest10Map(scd, "skill"),
		}),
		Dora: (scd) => ({
			skill: AvgBest10Map(scd, "skill"),
		}),
	},
	bms: {
		"7K": (scd) => ({
			sieglinde: AvgBest10Map(scd, "sieglinde"),
		}),
		"14K": (scd) => ({
			sieglinde: AvgBest10Map(scd, "sieglinde"),
		}),
	},
	pms: {
		Controller: (scd) => ({
			sieglinde: AvgBest10Map(scd, "sieglinde"),
		}),
		Keyboard: (scd) => ({
			sieglinde: AvgBest10Map(scd, "sieglinde"),
		}),
	},
	ddr: {
		SP: (scd) => ({
			MFCP: SumAll(scd, "MFCP"),
			ktRating: AvgBest10Map(scd, "ktRating"),
		}),
		DP: (scd) => ({
			MFCP: SumAll(scd, "MFCP"),
			ktRating: AvgBest10Map(scd, "ktRating"),
		}),
	},
	jubeat: {
		Single: (scd) => ({
			jubility: AvgBest10Map(scd, "jubility"),
		}),
	},
	usc: {
		Controller: (scd) => {
			const VF6 = AvgBest10Map(scd, "VF6");

			return {
				VF6,
				ProfileVF6: VF6 === null ? null : VF6 * 50,
			};
		},
		Keyboard: (scd) => {
			const VF6 = AvgBest10Map(scd, "VF6");

			return {
				VF6,
				ProfileVF6: VF6 === null ? null : VF6 * 50,
			};
		},
	},
	wacca: {
		Single: (scd) => ({
			rate: AvgBest10Map(scd, "rate"),
		}),
	},
};

export function CreateSessionCalcData(
	game: Game,
	playtype: Playtype,
	scoreCalcData: ScoreCalculatedDataOnly[]
): SessionDocument["calculatedData"] {
	// @ts-expect-error standard game->pt stuff.
	return CalculatedDataFunctions[game][playtype](scoreCalcData);
}
