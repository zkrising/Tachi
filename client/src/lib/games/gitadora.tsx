import { NumericSOV } from "util/sorts";
import { GPTClientImplementation } from "lib/types";
import { COLOUR_SET, GPTStrings } from "tachi-common";
import GitadoraJudgementCell from "components/tables/cells/GitadoraJudgementCell";
import LampCell from "components/tables/cells/LampCell";
import ScoreCell from "components/tables/cells/ScoreCell";
import { GetEnumColour } from "lib/game-implementations";
import React from "react";
import RatingCell from "components/tables/cells/RatingCell";
import { bgc } from "./_util";

const GITADORA_ENUM_COLOURS: GPTClientImplementation<
	"gitadora:Dora" | "gitadora:Gita"
>["enumColours"] = {
	grade: {
		C: COLOUR_SET.purple,
		B: COLOUR_SET.blue,
		A: COLOUR_SET.green,
		S: COLOUR_SET.orange,
		SS: COLOUR_SET.gold,
		MAX: COLOUR_SET.white,
	},
	lamp: {
		FAILED: COLOUR_SET.red,
		CLEAR: COLOUR_SET.blue,
		"FULL COMBO": COLOUR_SET.teal,
		EXCELLENT: COLOUR_SET.gold,
	},
};

const GITADORA_HEADERS: GPTClientImplementation<"gitadora:Dora" | "gitadora:Gita">["scoreHeaders"] =
	[
		["Percent", "Percent", NumericSOV((x) => x.scoreData.percent)],
		["Judgements", "Hits", NumericSOV((x) => x.scoreData.percent)],
		["Lamp", "Lamp", NumericSOV((x) => x.scoreData.enumIndexes.lamp)],
	];

const GITADORA_COLOURS: GPTClientImplementation<GPTStrings["gitadora"]>["classColours"] = {
	colour: {
		WHITE: bgc("white", "var(--bs-dark)"),
		ORANGE: bgc("orange", "var(--bs-dark)"),
		ORANGE_GRD: bgc("orange", "var(--bs-dark)"),
		YELLOW: bgc("var(--bs-warning)", "var(--bs-dark)"),
		YELLOW_GRD: bgc("var(--bs-warning)", "var(--bs-dark)"),
		GREEN: bgc("green", "var(--bs-light"),
		GREEN_GRD: bgc("green", "var(--bs-light"),
		BLUE: bgc("var(--bs-info)", "var(--bs-light)"),
		BLUE_GRD: bgc("var(--bs-info)", "var(--bs-light)"),
		PURPLE: bgc("purple", "var(--bs-light)"),
		PURPLE_GRD: bgc("purple", "var(--bs-light)"),
		RED: bgc("var(--bs-danger)", "var(--bs-light)"),
		RED_GRD: bgc("var(--bs-danger)", "var(--bs-light)"),
		BRONZE: bgc("sienna", "var(--bs-light)"),
		SILVER: bgc("silver", "var(--bs-dark)"),
		GOLD: bgc("gold", "var(--bs-dark)"),

		RAINBOW: {
			background:
				"linear-gradient(-45deg, #f0788a, #f48fb1, #9174c2, #79bcf2, #70a173, #f7ff99, #faca7d, #ff9d80, #f0788a)",
			color: "var(--bs-dark)",
		},
	},
};

const GITADORACoreCells: GPTClientImplementation<GPTStrings["gitadora"]>["scoreCoreCells"] = ({
	sc,
}) => (
	<>
		<ScoreCell
			colour={GetEnumColour(sc, "grade")}
			grade={sc.scoreData.grade}
			percent={sc.scoreData.percent}
		/>
		<GitadoraJudgementCell score={sc} />
		<LampCell lamp={sc.scoreData.lamp} colour={GetEnumColour(sc, "lamp")} />
	</>
);

const GITADORARatingCell: GPTClientImplementation<GPTStrings["gitadora"]>["ratingCell"] = ({
	sc,
	rating,
}) => <RatingCell score={sc} rating={rating} />;

export const GITADORA_GITA_IMPL: GPTClientImplementation<"gitadora:Gita"> = {
	sessionImportantScoreCount: 50,
	enumIcons: {
		grade: "sort-alpha-up",
		lamp: "lightbulb",
	},
	enumColours: GITADORA_ENUM_COLOURS,
	difficultyColours: {
		BASIC: COLOUR_SET.blue,
		ADVANCED: COLOUR_SET.orange,
		EXTREME: COLOUR_SET.red,
		MASTER: COLOUR_SET.purple,
		"BASS BASIC": COLOUR_SET.vibrantBlue,
		"BASS ADVANCED": COLOUR_SET.vibrantOrange,
		"BASS EXTREME": COLOUR_SET.vibrantRed,
		"BASS MASTER": COLOUR_SET.vibrantPurple,
	},
	ratingSystems: [],
	scoreHeaders: GITADORA_HEADERS,
	classColours: GITADORA_COLOURS,
	scoreCoreCells: GITADORACoreCells,
	ratingCell: GITADORARatingCell,
};

export const GITADORA_DORA_IMPL: GPTClientImplementation<"gitadora:Dora"> = {
	sessionImportantScoreCount: 50,
	enumIcons: {
		grade: "sort-alpha-up",
		lamp: "lightbulb",
	},
	enumColours: GITADORA_ENUM_COLOURS,
	difficultyColours: {
		BASIC: COLOUR_SET.blue,
		ADVANCED: COLOUR_SET.orange,
		EXTREME: COLOUR_SET.red,
		MASTER: COLOUR_SET.purple,
	},
	ratingSystems: [],
	scoreHeaders: GITADORA_HEADERS,
	classColours: GITADORA_COLOURS,
	scoreCoreCells: GITADORACoreCells,
	ratingCell: GITADORARatingCell,
};
