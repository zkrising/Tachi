import type {
	Game,
	IDStrings,
	Playtype,
	ScoreDocument,
	SessionCalculatedDataLookup,
	SessionDocument,
} from "tachi-common";

type ScoreCalculatedDataOnly = Pick<ScoreDocument, "calculatedData">;

const RELEVANT_SCORES = 10;

function AverageBest10(vals: Array<number | null | undefined>) {
	const numbers = vals.filter((e) => typeof e === "number") as Array<number>;

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

function SumAll(arr: Array<ScoreCalculatedDataOnly>, prop: keyof ScoreDocument["calculatedData"]) {
	return arr.reduce((a, e) => {
		if (typeof e.calculatedData[prop] === "number") {
			return a + e.calculatedData[prop]!;
		}

		return a;
	}, 0);
}

function AvgBest10Map(
	arr: Array<ScoreCalculatedDataOnly>,
	prop: keyof ScoreDocument["calculatedData"]
) {
	return AverageBest10(arr.map((e) => e.calculatedData[prop]));
}

type SessionCalcDataFn = (
	scd: Array<ScoreCalculatedDataOnly>
) => Partial<Record<SessionCalculatedDataLookup[IDStrings], number | null>>;

function GetGPTSessionCalcDataFn(game: Game, playtype: Playtype): SessionCalcDataFn {
	switch (`${game}:${playtype}` as IDStrings) {
		case "iidx:SP":
		case "iidx:DP":
			return (scd) => ({
				BPI: AvgBest10Map(scd, "BPI"),
				ktLampRating: AvgBest10Map(scd, "ktLampRating"),
			});
		case "sdvx:Single":
		case "usc:Controller":
		case "usc:Keyboard":
			return (scd) => {
				const VF6 = AvgBest10Map(scd, "VF6");

				return {
					VF6,
					ProfileVF6: VF6 === null ? null : VF6 * 50,
				};
			};

		case "popn:9B":
			return (scd) => ({
				classPoints: AvgBest10Map(scd, "classPoints"),
			});
		case "museca:Single":
			return (scd) => ({
				naiveRating: AvgBest10Map(scd, "rating"),
			});
		case "gitadora:Dora":
		case "gitadora:Gita":
			return (scd) => ({
				skill: AvgBest10Map(scd, "skill"),
			});
		case "bms:7K":
		case "bms:14K":
		case "pms:Controller":
		case "pms:Keyboard":
			return (scd) => ({
				sieglinde: AvgBest10Map(scd, "sieglinde"),
			});
		case "ddr:SP":
		case "ddr:DP":
			return (scd) => ({
				MFCP: SumAll(scd, "MFCP"),
				ktRating: AvgBest10Map(scd, "ktRating"),
			});
		case "jubeat:Single":
			return (scd) => ({
				jubility: AvgBest10Map(scd, "jubility"),
			});
		case "wacca:Single":
			return (scd) => ({
				rate: AvgBest10Map(scd, "rate"),
			});
		case "chunithm:Single":
			return (scd) => ({
				naiveRating: AvgBest10Map(scd, "rating"),
			});
		case "maimai:Single":
			return () => ({});
	}
}

export function CreateSessionCalcData(
	game: Game,
	playtype: Playtype,
	scoreCalcData: Array<ScoreCalculatedDataOnly>
): SessionDocument["calculatedData"] {
	const SessionCalculatedDataFunction = GetGPTSessionCalcDataFn(game, playtype);

	return SessionCalculatedDataFunction(scoreCalcData);
}
