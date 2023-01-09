import { CreatePBMergeFor } from "../utils";
import type { PBMergeFunction } from "../types";
import type { GPTStrings } from "tachi-common";

export const BMS_PMS_MERGERS: Array<PBMergeFunction<GPTStrings["bms" | "pms"]>> = [
	CreatePBMergeFor("enumIndexes.lamp", "Best Lamp", (base, lamp) => {
		base.scoreData.lamp = lamp.scoreData.lamp;

		// sgl is entirely lamp based.
		base.calculatedData.sieglinde = lamp.calculatedData.sieglinde;

		// technically these don't exist on PMS scores but since undefined is a
		// legal value for these properties it works out.
		base.scoreData.optional.gauge = lamp.scoreData.optional.gauge;
		base.scoreData.optional.gaugeHistory = lamp.scoreData.optional.gaugeHistory;
	}),
	CreatePBMergeFor("optional.bp", "Lowest BP", (base, bp) => {
		base.scoreData.optional.bp = bp.scoreData.optional.bp;
	}),
];
