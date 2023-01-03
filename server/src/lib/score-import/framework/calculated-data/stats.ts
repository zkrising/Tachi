import { GetGamePTConfig, IIDX_LAMPS } from "tachi-common";
import type { DryScore } from "../common/types";
import type { KtLogger } from "lib/logger/logger";
import type { ChartDocument, Game, integer, Playtype } from "tachi-common";

export function CalculateKTLampRatingIIDXSP(dryScore: DryScore, chart: ChartDocument<"iidx:SP">) {
	const ncValue = chart.tierlistInfo["kt-NC"]?.value ?? 0;
	const hcValue = Math.max(chart.tierlistInfo["kt-HC"]?.value ?? 0, ncValue);
	const exhcValue = Math.max(chart.tierlistInfo["kt-EXHC"]?.value ?? 0, hcValue);

	if (!exhcValue && !hcValue && !ncValue) {
		return LampRatingNoTierlistInfo(dryScore, "iidx", chart.playtype, chart);
	}

	const lamp = dryScore.scoreData.lamp;

	const gptConfig = GetGamePTConfig("iidx", chart.playtype);

	const lampIndex = gptConfig.lamps.indexOf(lamp);

	if (exhcValue && lampIndex >= IIDX_LAMPS.EX_HARD_CLEAR) {
		return exhcValue;
	} else if (hcValue && lampIndex >= IIDX_LAMPS.HARD_CLEAR) {
		return hcValue;
	} else if (ncValue && lampIndex >= IIDX_LAMPS.CLEAR) {
		return ncValue;
	}

	return 0;
}

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

function LampRatingNoTierlistInfo(
	dryScore: DryScore,
	game: Game,
	playtype: Playtype,
	chart: ChartDocument
) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const lamps = gptConfig.lamps;

	const CLEAR_LAMP_INDEX = lamps.indexOf(gptConfig.clearLamp);

	// if this is a clear
	if (lamps.indexOf(dryScore.scoreData.lamp) >= CLEAR_LAMP_INDEX) {
		// return this chart's numeric level as the lamp rating
		return chart.levelNum;
	}

	// else, this score is worth 0.
	return 0;
}

export function CalculateSieglinde(chart: ChartDocument, lampIndex: integer) {
	const ecValue = chart.tierlistInfo["sgl-EC"]?.value ?? 0;
	const hcValue = chart.tierlistInfo["sgl-HC"]?.value ?? 0;

	if (lampIndex >= IIDX_LAMPS.HARD_CLEAR) {
		return Math.max(hcValue, ecValue);
	} else if (lampIndex >= IIDX_LAMPS.EASY_CLEAR) {
		return ecValue;
	}

	return 0;
}
