import type {
	Game,
	IDStrings,
	integer,
	Playtype,
	ScoreDocument,
	SessionCalculatedDataLookup,
	SessionDocument,
} from "tachi-common";

type ScoreCalculatedDataOnly = Pick<ScoreDocument, "calculatedData">;

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
	return AverageBestN(
		arr.map((e) => e.calculatedData[prop]),
		10
	);
}

function AvgBestNMap(
	arr: Array<ScoreCalculatedDataOnly>,
	prop: keyof ScoreDocument["calculatedData"],
	n: integer
) {
	return AverageBestN(
		arr.map((e) => e.calculatedData[prop]),
		n
	);
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
		case "itg:Stamina":
			return (scd) => ({
				blockRating: AvgBestNMap(scd, "blockRating", 5),
				average32Speed: AvgBestNMap(scd, "highest32", 5),
			});
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
