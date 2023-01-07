import { GPTString, GetGamePTConfig, IIDX_LAMPS } from "tachi-common";
import type { DryScore } from "../common/types";
import type { KtLogger } from "lib/logger/logger";
import type { ChartDocument, Game, integer, Playtype, GPTStrings } from "tachi-common";
import type { GetEnumValue } from "tachi-common/types/metrics";

export function CalculateKTLampRatingIIDXDP(dryScore: DryScore, chart: ChartDocument<"iidx:DP">) {
	const tierlistValue = chart.tierlistInfo["dp-tier"]?.value ?? 0;

	if (!tierlistValue) {
		return LampRatingNoTierlistInfo(dryScore, "iidx", chart.playtype, chart);
	}

	const lamp = dryScore.scoreData.lamp;

	const gptConfig = GetGamePTConfig("iidx", chart.playtype);

	const lampIndex = gptConfig.lamps.indexOf(lamp);

	if (lampIndex >= IIDX_LAMPS.EASY_CLEAR) {
		return tierlistValue;
	}

	return 0;
}
