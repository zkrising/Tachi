import { IsNullish } from "util/misc";
import { NumericSOV } from "util/sorts";
import { GPTClientImplementation } from "lib/types";
import { COLOUR_SET, GPTStrings, IIDXLIKE_GBOUNDARIES } from "tachi-common";
import { FormatSieglindeBMS } from "tachi-common/config/game-support/bms";
import BMSOrPMSLampCell from "components/tables/cells/BMSOrPMSLampCell";
import DeltaCell from "components/tables/cells/DeltaCell";
import ScoreCell from "components/tables/cells/ScoreCell";
import React from "react";
import RatingCell from "components/tables/cells/RatingCell";
import { GPT_CLIENT_IMPLEMENTATIONS, GetEnumColour } from "lib/game-implementations";
import { CreateRatingSys, bg } from "./_util";

const BASE_IMPL: GPTClientImplementation<GPTStrings["bms" | "pms"]> = {
	difficultyColours: {
		CHART: COLOUR_SET.gray, // lol
	},
	enumIcons: {
		grade: "sort-alpha-up",
		lamp: "lightbulb",
	},
	enumColours: {
		grade: {
			F: COLOUR_SET.gray,
			E: COLOUR_SET.red,
			D: COLOUR_SET.maroon,
			C: COLOUR_SET.purple,
			B: COLOUR_SET.paleBlue,
			A: COLOUR_SET.green,
			AA: COLOUR_SET.blue,
			AAA: COLOUR_SET.gold,
			"MAX-": COLOUR_SET.teal,
			MAX: COLOUR_SET.white,
		},
		lamp: {
			"NO PLAY": COLOUR_SET.gray,
			FAILED: COLOUR_SET.red,
			"ASSIST CLEAR": COLOUR_SET.purple,
			"EASY CLEAR": COLOUR_SET.green,
			CLEAR: COLOUR_SET.blue,
			"HARD CLEAR": COLOUR_SET.orange,
			"EX HARD CLEAR": COLOUR_SET.gold,
			"FULL COMBO": COLOUR_SET.teal,
		},
	},
	classColours: {},
	ratingSystems: [
		CreateRatingSys(
			"Sieglinde EC",
			"TODO lol",
			(c) => c.data.sglEC,
			(c) => (IsNullish(c.data.sglEC) ? null : FormatSieglindeBMS(c.data.sglEC!))
		),
		CreateRatingSys(
			"Sieglinde HC",
			"TODO lol",
			(c) => c.data.sglHC,
			(c) => (IsNullish(c.data.sglHC) ? null : FormatSieglindeBMS(c.data.sglHC!))
		),
	],
	scoreHeaders: [
		["Score", "Score", NumericSOV((x) => x.scoreData.percent)],
		["Deltas", "Deltas", NumericSOV((x) => x.scoreData.percent)],
		["Lamp", "Lamp", NumericSOV((x) => x.scoreData.enumIndexes.lamp)],
	],
	scoreCoreCells: ({ sc }) => (
		<>
			<ScoreCell
				colour={GetEnumColour(sc, "grade")}
				grade={sc.scoreData.grade}
				percent={sc.scoreData.percent}
				score={sc.scoreData.score}
			/>
			<DeltaCell
				gradeBoundaries={IIDXLIKE_GBOUNDARIES}
				value={sc.scoreData.percent}
				grade={sc.scoreData.grade}
				formatNumFn={(deltaPercent) => {
					const max = Math.floor(sc.scoreData.score / (sc.scoreData.percent / 100));

					const v = (deltaPercent / 100) * max;

					return Math.round(v).toFixed(0);
				}}
			/>
			<BMSOrPMSLampCell score={sc} />
		</>
	),
	ratingCell: ({ sc, rating }) => <RatingCell score={sc} rating={rating} />,
};

export const BMS_7K_IMPL: GPTClientImplementation<"bms:7K"> = {
	...BASE_IMPL,
	classColours: {
		genocideDan: {
			NORMAL_1: bg("lightblue"),
			NORMAL_2: bg("lightblue"),
			NORMAL_3: bg("lightblue"),
			NORMAL_4: bg("lightblue"),
			NORMAL_5: bg("lightblue"),
			NORMAL_6: bg("lightblue"),
			NORMAL_7: bg("lightblue"),
			NORMAL_8: bg("lightblue"),
			NORMAL_9: bg("lightred"),
			NORMAL_10: bg("lightred"),
			INSANE_1: "info",
			INSANE_2: "info",
			INSANE_3: "info",
			INSANE_4: "info",
			INSANE_5: "info",
			INSANE_6: "info",
			INSANE_7: "info",
			INSANE_8: "info",
			INSANE_9: bg("red"),
			INSANE_10: bg("red"),
			INSANE_KAIDEN: bg("teal"),
			OVERJOY: bg("purple"),
		},
		lnDan: {
			DAN_1: bg("lightblue"),
			DAN_2: bg("lightblue"),
			DAN_3: bg("lightblue"),
			DAN_4: bg("lightblue"),
			DAN_5: bg("lightblue"),
			DAN_6: bg("lightblue"),
			DAN_7: bg("lightblue"),
			DAN_8: bg("lightblue"),
			DAN_9: bg("lightred"),
			DAN_10: bg("lightred"),
			KAIDEN: bg("teal"),
			OVERJOY: bg("purple"),
			UDON: bg("gold"),
		},
		scratchDan: {
			KYU_7: bg("green"),
			KYU_6: bg("green"),
			KYU_5: bg("green"),
			KYU_4: bg("green"),
			KYU_3: bg("green"),
			KYU_2: bg("green"),
			KYU_1: bg("green"),
			DAN_1: "info",
			DAN_2: "info",
			DAN_3: "info",
			DAN_4: "info",
			DAN_5: "info",
			DAN_6: "info",
			DAN_7: "info",
			DAN_8: "info",
			DAN_9: "danger",
			DAN_10: "danger",
			KAIDEN: "warning",
		},
		stslDan: {
			SL0: null,
			SL1: null,
			SL2: null,
			SL3: null,
			SL4: null,
			SL5: null,
			SL6: null,
			SL7: null,
			SL8: null,
			SL9: null,
			SL10: null,
			SL11: null,
			SL12: null,
			ST0: null,
			ST1: null,
			ST2: null,
			ST3: null,
			ST4: null,
			ST5: null,
			ST6: null,
			ST7: null,
			ST8: null,
			ST9: null,
			ST10: null,
			ST11: null,
		},
	},
};

export const BMS_14K_IMPL: GPTClientImplementation<"bms:14K"> = {
	...BASE_IMPL,
	classColours: {
		genocideDan: BMS_7K_IMPL.classColours.genocideDan,
		stslDan: {
			SL0: null,
			SL1: null,
			SL2: null,
			SL3: null,
			SL4: null,
			SL5: null,
			SL6: null,
			SL7: null,
			SL8: null,
			SL9: null,
			SL10: null,
			SL11: null,
			SL12: null,
		},
	},
};

export const PMS_IMPL: GPTClientImplementation<GPTStrings["pms"]> = {
	...BASE_IMPL,
	classColours: {
		dan: {
			INSANE_1: "info",
			INSANE_2: "info",
			INSANE_3: "info",
			INSANE_4: "info",
			INSANE_5: "info",
			INSANE_6: "info",
			INSANE_7: "info",
			INSANE_8: "info",
			INSANE_9: bg("red"),
			INSANE_10: bg("red"),
			INSANE_KAIDEN: bg("teal"),
			OVERJOY: bg("purple"),
			UNDEFINED: "warning",
		},
	},
};
