/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// disable all type checking, this is a legacy file and is only kept around
// as a reference

import { Game, Playtypes, ChartDocument, ChartDocument } from "../types";

// human readable stuff for versions
const versionHuman: Record<Game, Record<string, string>> = {
	iidx: {
		0: "1st Style",
		1: "substream",
		2: "2nd Style",
		3: "3rd Style",
		4: "4th Style",
		5: "5th Style",
		6: "6th Style",
		7: "7th Style",
		8: "8th Style",
		9: "9th Style",
		10: "10th Style",
		11: "IIDX RED",
		12: "HAPPY SKY",
		13: "DISTORTED",
		14: "GOLD",
		15: "DJ TROOPERS",
		16: "EMPRESS",
		17: "SIRIUS",
		18: "Resort Anthem",
		19: "Lincle",
		20: "tricoro",
		21: "SPADA",
		22: "PENDUAL",
		23: "copula",
		24: "SINOBUZ",
		25: "CANNON BALLERS",
		26: "ROOTAGE",
		27: "HEROIC VERSE",
		28: "BISTROVER",
	},
	museca: {
		1: "",
		1.5: "1+1/2",
	},
	maimai: {
		maimai: "",
		maimaiplus: "PLUS",
		green: "GReeN",
		greenplus: "GReeN PLUS",
		orange: "ORANGE",
		orangeplus: "ORANGE PLUS",
		pink: "PiNK",
		pinkplus: "PiNK PLUS",
		murasaki: "MURASAKi",
		murasakiplus: "MURASAKi PLUS",
		milk: "MiLK",
		milkplus: "MiLK PLUS",
		finale: "FiNALE",
	},
	// jubeat: {
	//     jubeat: "",
	//     ripples: "ripples",
	//     knit: "knit",
	//     copious: "copious",
	//     saucer: "saucer",
	//     saucerfulfill: "saucer fulfill",
	//     prop: "prop",
	//     qubell: "Qubell",
	//     clan: "clan",
	//     festo: "festo",
	// },
	// popn: {
	//     1: "1",
	//     2: "2",
	//     3: "3",
	//     4: "4",
	//     5: "5",
	//     6: "6",
	//     7: "7",
	//     8: "8",
	//     9: "9",
	//     10: "10",
	//     11: "11",
	//     12: "12 Iroha",
	//     13: "13 CARNIVAL",
	//     14: "14 FEVER!",
	//     15: "15 ADVENTURE",
	//     16: "16 PARTY♪",
	//     17: "17 THE MOVIE",
	//     18: "18 Sengoku",
	//     19: "19 TUNE STREET",
	//     20: "20 fantasia",
	//     park: "Sunny Park",
	//     lapis: "Lapistoria",
	//     eclale: "éclale",
	//     usaneko: "Usaneko",
	//     peace: "peace",
	// },
	sdvx: {
		booth: "BOOTH",
		inf: "II -infinite infection-",
		gw: "III GRAVITY WARS",
		heaven: "IV HEAVENLY HAVEN",
		vivid: "V VIVID WAVE",
	},
	ddr: {
		1: "1st Mix",
		2: "2nd Mix",
		3: "3rd Mix",
		4: "4th Mix",
		5: "5th Mix",
		max: "MAX",
		max2: "MAX2",
		extreme: "EXTREME",
		snova: "SuperNOVA",
		snova2: "SuperNOVA 2",
		x: "X",
		x2: "X2",
		x3: "X3 vs. 2nd Mix",
		2013: "(2013)",
		2014: "(2014)",
		a: "Ace",
		a20: "A20",
	},
	chunithm: {
		chuni: "",
		chuniplus: "PLUS",
		air: "AIR",
		airplus: "AIR PLUS",
		star: "STAR",
		starplus: "STAR PLUS",
		amazon: "AMAZON",
		amazonplus: "AMAZON PLUS",
		crystal: "CRYSTAL",
		crystalplus: "CRYSTAL PLUS",
	},
	gitadora: {
		xg: "XG",
		xg2: "XG2",
		xg3: "XG3",
		gitadora: "",
		overdrive: "OverDrive",
		triboost: "Tri-Boost",
		triboostplus: "Tri-Boost (Re:EVOLVE)",
		matixx: "Matixx",
		exchain: "EXCHAIN",
		nextage: "NEX+AGE",
	},
	bms: {
		0: "BMS",
	},
	usc: {
		0: "USC",
	},
};

// release orders of the games.
const gameOrders = {
	iidx: [
		"0",
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
		"11",
		"12",
		"13",
		"14",
		"15",
		"16",
		"17",
		"18",
		"19",
		"20",
		"21",
		"22",
		"23",
		"24",
		"25",
		"26",
		"27",
		"28",
	],
	museca: ["1", "1.5"],
	maimai: [
		"maimai",
		"maimaiplus",
		"green",
		"greenplus",
		"orange",
		"orangeplus",
		"pink",
		"pinkplus",
		"murasaki",
		"murasakiplus",
		"milk",
		"milkplus",
		"finale",
	],
	jubeat: [
		"jubeat",
		"ripples",
		"knit",
		"copious",
		"saucer",
		"saucerfulfill",
		"prop",
		"qubell",
		"clan",
		"festo",
	],
	popn: [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
		"11",
		"12",
		"13",
		"14",
		"15",
		"16",
		"17",
		"18",
		"19",
		"20",
		"park",
		"lapis",
		"eclale",
		"usaneko",
		"peace",
	],
	sdvx: ["booth", "inf", "gw", "heaven", "vivid"],
	ddr: [
		"1",
		"2",
		"3",
		"4",
		"5",
		"max",
		"max2",
		"extreme",
		"snova",
		"snova2",
		"x",
		"x2",
		"x3",
		"2013",
		"2014",
		"a",
		"a20",
	],
	bms: ["0"],
	chunithm: [
		"chuni",
		"chuniplus",
		"air",
		"airplus",
		"star",
		"starplus",
		"amazon",
		"amazonplus",
		"crystal",
		"crystalplus",
	],
	gitadora: [
		"gf1",
		"gf2dm1",
		"gf3dm2",
		"gf4dm3",
		"gf5dm4",
		"gf6dm5",
		"gf7dm6",
		"gf8dm7",
		"gf8dm7plus",
		"gf9dm8",
		"gf10dm9",
		"gf11dm10",
		"v",
		"v2",
		"v3",
		"v4",
		"v5",
		"v6",
		"v7",
		"v8",
		"xg",
		"xg2",
		"xg3",
		"gitadora",
		"overdrive",
		"triboost",
		"triboostplus",
		"matixx",
		"exchain",
		"nextage",
	],
	usc: ["0"],
};

function humaniseGame<T extends Game>(game: T, pt?: Playtypes[T]): string {
	if (!pt) {
		return gameHuman[game];
	}

	if (validPlaytypes[game].length === 1) {
		return gameHuman[game];
	}

	return `${gameHuman[game]} (${pt})`;
}

const ratingParameters = {
	iidx: {
		failHarshnessMultiplier: 0.3,
		pivotPercent: 0.7777, // Grade: AA
		clearExpMultiplier: 1,
	},
	bms: {
		failHarshnessMultiplier: 0.5,
		pivotPercent: 0.7777, // Grade: AA
		clearExpMultiplier: 0.75,
	},
	museca: {
		failHarshnessMultiplier: 1,
		pivotPercent: 0.8, // grade: not fail
		clearExpMultiplier: 1, // no real reason
	},
	popn: {
		failHarshnessMultiplier: 1,
		pivotPercent: 0.8, // grade: A
		clearExpMultiplier: 0.4, // no real reason
	},
	maimai: {
		failHarshnessMultiplier: 1,
		pivotPercent: 0.8,
		clearExpMultiplier: 1,
	},
	jubeat: {
		failHarshnessMultiplier: 0.9,
		pivotPercent: 0.7, // grade: A (clear)
		clearExpMultiplier: 1,
	},
	sdvx: {
		failHarshnessMultiplier: 1,
		pivotPercent: 0.92,
		clearExpMultiplier: 1.45, // testing
	},
	usc: {
		failHarshnessMultiplier: 1,
		pivotPercent: 0.92,
		clearExpMultiplier: 1.45, // testing
	},
	ddr: {
		failHarshnessMultiplier: 0.9,
		pivotPercent: 0.9,
		clearExpMultiplier: 1,
	},
	chunithm: {
		failHarshnessMultiplier: 1,
		pivotPercent: 0.975,
		clearExpMultiplier: 1.1,
	},
	gitadora: {
		// GENERIC PARAMS. THIS IS **NOT** THE USED CALC.
		failHarshnessMultiplier: 1,
		pivotPercent: 0.8,
		clearExpMultiplier: 1.1,
	},
};

function ChangeAlpha(string: string, alpha: string): string {
	const spl = string.split(",");
	spl[spl.length - 1] = `${alpha})`;
	return spl.join(",");
}

function DirectScoreGradeDelta(
	game: Game,
	score: number,
	percent: number,
	chart: ChartDocument,
	delta: number
): SGDReturn | null {
	const grade = GetGrade(game, percent);

	if (!grade) {
		throw new Error(`Invalid grade created from ${game}, ${percent}`);
	}

	const scoreObj: PartialScore = {
		scoreData: {
			score,
			grade,
		},
	};

	return ScoreGradeDelta(game, scoreObj, chart, delta);
}

interface SGDReturn {
	grade: string;
	delta: number;
	formattedString: string;
}

interface PartialScore {
	scoreData: {
		score: number;
		grade: string;
	};
}

function ScoreGradeDelta(
	game: Game,
	score: PartialScore,
	chart: ChartDocument,
	delta: number
): SGDReturn | null {
	const nextGrade = grades[game][grades[game].indexOf(score.scoreData.grade) + delta];

	if (nextGrade) {
		const nextGradePercent = gradeBoundaries[game][grades[game].indexOf(nextGrade)];

		const nGScore = CalculateScore(game, nextGradePercent, chart);

		if (nGScore) {
			const delta = score.scoreData.score - nGScore;
			let formattedString = `(${nextGrade})`;

			if (Number.isInteger(delta)) {
				formattedString += delta >= 0 ? `+${delta}` : `${delta}`;
			} else {
				formattedString += delta >= 0 ? `+${delta.toFixed(2)}` : `${delta.toFixed(2)}`;
			}

			return {
				grade: nextGrade,
				delta: delta,
				formattedString: formattedString,
			};
		} else {
			return null;
		}
	} else {
		return null;
	}
}

function AbsoluteScoreGradeDelta(
	game: Game,
	score: number,
	percent: number,
	absDelta: number
): SGDReturn | null {
	const grade = grades[game][absDelta];
	if (grade) {
		let chart = null;
		if (game === "iidx" || game === "bms") {
			const reversedNC = Math.floor((score / percent) * 100) / 2;
			chart = {
				data: {
					notecount: reversedNC,
				},
			} as unknown; // heheh
		}

		const sc = CalculateScore(game, gradeBoundaries[game][absDelta], chart as ChartDocument);
		if (sc) {
			const delta = score - sc;
			let formattedString = `(${grade})`;
			formattedString += delta >= 0 ? `+${delta}` : `${delta}`;
			return {
				grade: grade,
				delta: delta,
				formattedString: formattedString,
			};
		} else {
			return null;
		}
	} else {
		return null;
	}
}

function CalculateScore(game: Game, percent: number, chart: ChartDocument): number | null {
	let score = percent;

	if (game === "iidx" || game === "bms") {
		score = (chart as ChartDocument<"iidx:SP">).data.notecount * 2 * (percent / 100);
	} else if (game === "ddr" || game === "museca" || game === "jubeat" || game === "chunithm") {
		score = 1_000_000 * (percent / 100);
	} else if (game === "popn") {
		score = 100_000 * (percent / 100);
	} else if (game === "sdvx" || game === "usc") {
		score = 10_000_000 * (percent / 100);
	}

	if (score) {
		return score;
	}
	return null;
}

function PercentToScore(percent: number, game: Game, chartData: ChartDocument): number {
	let eScore = 0;

	if (game === "iidx" || game === "bms") {
		eScore = percent * (chartData as ChartDocument<"iidx:SP">).data.notecount * 2;
	} else if (game === "museca" || game === "jubeat") {
		eScore = percent * 1000000;
	} else if (game === "popn") {
		eScore = percent * 100000;
	} else if (game === "sdvx" || game === "usc") {
		eScore = percent * 10000000;
	} else if (game === "ddr") {
		// todo
	} else if (game === "chunithm") {
		eScore = percent * 1000000;
	} else if (game === "gitadora") {
		eScore = percent;
	}

	return eScore;
}
