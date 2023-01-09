import { CreatePBMergeFor } from "../utils";
import type { PBMergeFunction } from "../types";
import type { GPTStrings } from "tachi-common";

export const IIDX_MERGERS: Array<PBMergeFunction<GPTStrings["iidx"]>> = [
	CreatePBMergeFor("enumIndexes.lamp", "Best Lamp", (base, lamp) => {
		// lampRating needs to be updated.
		base.calculatedData.ktLampRating = lamp.calculatedData.ktLampRating;

		// Update lamp related iidx-specific info from the lampPB.
		base.scoreData.optional.gsmEasy = lamp.scoreData.optional.gsmEasy;
		base.scoreData.optional.gsmNormal = lamp.scoreData.optional.gsmNormal;
		base.scoreData.optional.gsmHard = lamp.scoreData.optional.gsmHard;
		base.scoreData.optional.gsmEXHard = lamp.scoreData.optional.gsmEXHard;

		base.scoreData.optional.gauge = lamp.scoreData.optional.gauge;
		base.scoreData.optional.gaugeHistory = lamp.scoreData.optional.gaugeHistory;

		base.scoreData.optional.comboBreak = lamp.scoreData.optional.comboBreak;
	}),
	CreatePBMergeFor("optional.bp", "Lowest BP", (base, bp) => {
		base.scoreData.optional.bp = bp.scoreData.optional.bp;
	}),
];
