import { NumericSOV } from "util/sorts";
import { GPTClientImplementation } from "lib/types";
import { COLOUR_SET, GPTStrings } from "tachi-common";
import ScoreCell from "components/tables/cells/ScoreCell";
import { GetEnumColour } from "lib/game-implementations";
import React from "react";
import RatingCell from "components/tables/cells/RatingCell";
import LampCell from "../../components/tables/cells/LampCell";
import DDRScoreCell from "../../components/tables/cells/DDRScoreCell";
import { bg, bgc } from "./_util";

const DDR_ENUM_COLOURS: GPTClientImplementation<GPTStrings["ddr"]>["enumColours"] = {
	grade: {
		E: COLOUR_SET.gray,
		D: COLOUR_SET.paleBlue,
		"D+": COLOUR_SET.paleBlue,
		"C-": COLOUR_SET.purple,
		C: COLOUR_SET.purple,
		"C+": COLOUR_SET.purple,
		"B-": COLOUR_SET.blue,
		B: COLOUR_SET.blue,
		"B+": COLOUR_SET.blue,
		"A-": COLOUR_SET.gold,
		A: COLOUR_SET.gold,
		"A+": COLOUR_SET.gold,
		"AA-": COLOUR_SET.gold,
		AA: COLOUR_SET.gold,
		"AA+": COLOUR_SET.gold,
		AAA: COLOUR_SET.teal,
	},
	lamp: {
		FAILED: COLOUR_SET.maroon,
		ASSIST: COLOUR_SET.purple,
		CLEAR: COLOUR_SET.blue,
		"FULL COMBO": COLOUR_SET.vibrantBlue,
		"GREAT FULL COMBO": COLOUR_SET.vibrantGreen,
		"PERFECT FULL COMBO": COLOUR_SET.gold,
		"MARVELOUS FULL COMBO": COLOUR_SET.pink,
		LIFE4: COLOUR_SET.vibrantRed,
	},
};

const DDR_DIFF_COLOURS: GPTClientImplementation<GPTStrings["ddr"]>["difficultyColours"] = {
	BEGINNER: COLOUR_SET.blue,
	BASIC: COLOUR_SET.paleGreen,
	DIFFICULT: COLOUR_SET.red,
	EXPERT: COLOUR_SET.vibrantYellow,
	CHALLENGE: COLOUR_SET.purple,
};

const DDR_HEADERS: GPTClientImplementation<"ddr:SP" | "ddr:DP">["scoreHeaders"] = [
	["Score", "Score", NumericSOV((x) => x.scoreData.score)],
	["Lamp", "Lamp", NumericSOV((x) => x.scoreData.enumIndexes.lamp)],
];

const DDR_COLOURS: GPTClientImplementation<"ddr:SP" | "ddr:DP">["classColours"] = {
	flare: {
		NONE: bg("gray"),
		"NONE+": bg("gray"),
		"NONE++": bg("gray"),
		"NONE+++": bg("gray"),
		MERCURY: bg("blue"),
		"MERCURY+": bg("blue"),
		"MERCURY++": bg("blue"),
		"MERCURY+++": bg("blue"),
		VENUS: bgc("yellow", "black"),
		"VENUS+": bgc("yellow", "black"),
		"VENUS++": bgc("yellow", "black"),
		"VENUS+++": bgc("yellow", "black"),
		EARTH: bg("forestgreen"),
		"EARTH+": bg("forestgreen"),
		"EARTH++": bg("forestgreen"),
		"EARTH+++": bg("forestgreen"),
		MARS: bg("red"),
		"MARS+": bg("red"),
		"MARS++": bg("red"),
		"MARS+++": bg("red"),
		JUPITER: bg("darkgreen"),
		"JUPITER+": bg("darkgreen"),
		"JUPITER++": bg("darkgreen"),
		"JUPITER+++": bg("darkgreen"),
		SATURN: bg("purple"),
		"SATURN+": bg("purple"),
		"SATURN++": bg("purple"),
		"SATURN+++": bg("purple"),
		URANUS: bgc("powderblue", "black"),
		"URANUS+": bgc("powderblue", "black"),
		"URANUS++": bgc("powderblue", "black"),
		"URANUS+++": bgc("powderblue", "black"),
		NEPTUNE: bg("darkslateblue"),
		"NEPTUNE+": bg("darkslateblue"),
		"NEPTUNE++": bg("darkslateblue"),
		"NEPTUNE+++": bg("darkslateblue"),
		SUN: bg("orange"),
		"SUN+": bg("orange"),
		"SUN++": bg("orange"),
		"SUN+++": bg("orange"),
		WORLD: bg("black"),
	},
};

const DDRCoreCells: GPTClientImplementation<GPTStrings["ddr"]>["scoreCoreCells"] = ({
	sc,
	chart,
}) => (
	<>
		<DDRScoreCell
			colour={GetEnumColour(sc, "grade")}
			grade={sc.scoreData.grade}
			score={sc.scoreData.score}
		/>
		<LampCell lamp={sc.scoreData.lamp} colour={GetEnumColour(sc, "lamp")} />
	</>
);

const DDRRatingCell: GPTClientImplementation<GPTStrings["ddr"]>["ratingCell"] = ({
	sc,
	chart,
	rating,
}) => (
	<>
		<RatingCell rating={rating} score={sc} />
	</>
);

export const DDR_SP_IMPL: GPTClientImplementation<"ddr:SP"> = {
	sessionImportantScoreCount: 20,
	difficultyColours: DDR_DIFF_COLOURS,
	enumColours: DDR_ENUM_COLOURS,
	enumIcons: {
		grade: "sort-alpha-up",
		lamp: "lightbulb",
	},
	ratingSystems: [],
	scoreHeaders: DDR_HEADERS,
	classColours: DDR_COLOURS,
	scoreCoreCells: DDRCoreCells,
	ratingCell: DDRRatingCell,
};

export const DDR_DP_IMPL: GPTClientImplementation<"ddr:DP"> = {
	sessionImportantScoreCount: 20,
	difficultyColours: DDR_DIFF_COLOURS,
	enumColours: DDR_ENUM_COLOURS,
	enumIcons: {
		grade: "sort-alpha-up",
		lamp: "lightbulb",
	},
	ratingSystems: [],
	scoreHeaders: DDR_HEADERS,
	classColours: DDR_COLOURS,
	scoreCoreCells: DDRCoreCells,
	ratingCell: DDRRatingCell,
};
