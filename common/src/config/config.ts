/* eslint-disable lines-around-comment */

import { ARCAEA_CONF, ARCAEA_TOUCH_CONF } from "./game-support/arcaea";
import { BMS_14K_CONF, BMS_7K_CONF, BMS_CONF } from "./game-support/bms";
import { CHUNITHM_CONF, CHUNITHM_SINGLE_CONF } from "./game-support/chunithm";
import { DDR_CONF, DDR_DP_CONF, DDR_SP_CONF } from "./game-support/ddr";
import { GITADORA_CONF, GITADORA_DORA_CONF, GITADORA_GITA_CONF } from "./game-support/gitadora";
import { IIDX_CONF, IIDX_DP_CONF, IIDX_SP_CONF } from "./game-support/iidx";
import { ITG_CONF, ITG_STAMINA_CONF } from "./game-support/itg";
import { JUBEAT_CONF, JUBEAT_SINGLE_CONF } from "./game-support/jubeat";
import { MAIMAI_CONF, MAIMAI_SINGLE_CONF } from "./game-support/maimai";
import { MAIMAI_DX_CONF, MAIMAI_DX_SINGLE_CONF } from "./game-support/maimai-dx";
import { MUSECA_CONF, MUSECA_SINGLE_CONF } from "./game-support/museca";
import { ONGEKI_CONF, ONGEKI_SINGLE_CONF } from "./game-support/ongeki";
import { PMS_CONF, PMS_CONTROLLER_CONF, PMS_KEYBOARD_CONF } from "./game-support/pms";
import { POPN_9B_CONF, POPN_CONF } from "./game-support/popn";
import { SDVX_CONF, SDVX_SINGLE_CONF } from "./game-support/sdvx";
import { USC_CONF, USC_CONTROLLER_CONF, USC_KEYBOARD_CONF } from "./game-support/usc";
import { WACCA_CONF, WACCA_SINGLE_CONF } from "./game-support/wacca";
import { p } from "prudence";
import type {
	GPTString,
	Game,
	GameConfig,
	GamePTConfig,
	Playtype,
	Playtypes,
} from "../types/game-config";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GAME_PT_CONFIG } from "../types/internals";
import type { ConfEnumScoreMetric, ConfScoreMetric } from "../types/metrics";

/**
 * All game configurations that Tachi supports.
 *
 * @warn DO NOT ACCESS THIS DIRECTLY! Use @see {GetGameConfig} for better type safety.
 */
export const GAME_CONFIGS = {
	iidx: IIDX_CONF,
	museca: MUSECA_CONF,
	chunithm: CHUNITHM_CONF,
	bms: BMS_CONF,
	gitadora: GITADORA_CONF,
	jubeat: JUBEAT_CONF,
	maimai: MAIMAI_CONF,
	maimaidx: MAIMAI_DX_CONF,
	popn: POPN_CONF,
	sdvx: SDVX_CONF,
	usc: USC_CONF,
	wacca: WACCA_CONF,
	pms: PMS_CONF,
	itg: ITG_CONF,
	arcaea: ARCAEA_CONF,
	ongeki: ONGEKI_CONF,
	ddr: DDR_CONF,
} as const satisfies Record<string, INTERNAL_GAME_CONFIG>;

/**
 * Returns the configuration for this game.
 */
export function GetGameConfig<G extends Game>(game: G): GameConfig<G> {
	// Hacky force-type-cast here. TypeScript gets a little confused with
	// the amount of (frankly insane) type screwery going on here.
	return GAME_CONFIGS[game] as unknown as GameConfig<G>;
}

/**
 * Given a game and playtype, combine them into a GPTString.
 */
export function GetGPTString(game: Game, playtype: Playtype): GPTString {
	return `${game}:${playtype}` as GPTString;
}

export function SplitGPT(gpt: GPTString) {
	return gpt.split(":") as [Game, Playtype];
}

/**
 * Based on every declared playtype for every declared game, they all need a GPT
 * config. This controls almost everything about each GPT.
 */
export const GAME_PT_CONFIGS = {
	"iidx:SP": IIDX_SP_CONF,
	"iidx:DP": IIDX_DP_CONF,
	"museca:Single": MUSECA_SINGLE_CONF,
	"sdvx:Single": SDVX_SINGLE_CONF,
	"bms:14K": BMS_14K_CONF,
	"bms:7K": BMS_7K_CONF,
	"gitadora:Dora": GITADORA_DORA_CONF,
	"gitadora:Gita": GITADORA_GITA_CONF,
	"chunithm:Single": CHUNITHM_SINGLE_CONF,
	"wacca:Single": WACCA_SINGLE_CONF,
	"jubeat:Single": JUBEAT_SINGLE_CONF,
	"popn:9B": POPN_9B_CONF,
	"maimai:Single": MAIMAI_SINGLE_CONF,
	"maimaidx:Single": MAIMAI_DX_SINGLE_CONF,
	"pms:Controller": PMS_CONTROLLER_CONF,
	"pms:Keyboard": PMS_KEYBOARD_CONF,
	"usc:Controller": USC_CONTROLLER_CONF,
	"usc:Keyboard": USC_KEYBOARD_CONF,
	"itg:Stamina": ITG_STAMINA_CONF,
	"arcaea:Touch": ARCAEA_TOUCH_CONF,
	"ongeki:Single": ONGEKI_SINGLE_CONF,
	"ddr:SP": DDR_SP_CONF,
	"ddr:DP": DDR_DP_CONF,
} as const satisfies Record<GPTString, INTERNAL_GAME_PT_CONFIG>;

/**
 * Returns the configuration for this Game + Playtype. The type here is expanded to
 * its most generic form, for easiest interaction.
 */
export function GetGamePTConfig(game: Game, playtype: Playtypes[Game]): GamePTConfig {
	const gptString = GetGPTString(game, playtype);

	return GAME_PT_CONFIGS[gptString] as unknown as GamePTConfig;
}

export function GetGPTConfig(gptString: GPTString): GamePTConfig {
	return GAME_PT_CONFIGS[gptString] as unknown as GamePTConfig;
}

/**
 * Returns the configuration for this specific Game + Playtype. This type is narrowed
 * down to its least generic form, and is instead for gpt-specific use cases.
 */
export function GetSpecificGPTConfig<GPT extends GPTString>(gpt: GPT) {
	return GAME_PT_CONFIGS[gpt];
}

export const allSupportedGames = Object.keys(GAME_CONFIGS) as Array<Game>;
export const allGPTStrings = Object.keys(GAME_PT_CONFIGS) as Array<GPTString>;

export function GetScoreMetrics(
	gptConfig: GamePTConfig,
	type?: Array<ConfScoreMetric["type"]> | ConfScoreMetric["type"]
) {
	let metrics = [
		...Object.entries(gptConfig.providedMetrics),
		...Object.entries(gptConfig.derivedMetrics),
	];

	if (Array.isArray(type)) {
		metrics = metrics.filter(([_key, conf]) => type.includes(conf.type));
	} else if (type) {
		metrics = metrics.filter(([_key, conf]) => conf.type === type);
	}

	return metrics.map((e) => e[0]);
}

export function GetScoreEnumConfs(gptConfig: GamePTConfig) {
	const scoreMetrics = {
		...gptConfig.providedMetrics,
		...gptConfig.derivedMetrics,
	};

	const enumMetrics: Record<string, ConfEnumScoreMetric<string>> = {};

	for (const [key, value] of Object.entries(scoreMetrics)) {
		if (value.type === "ENUM") {
			enumMetrics[key] = value;
		}
	}

	return enumMetrics;
}

/**
 * Given a name for a metric and a value, check whether its sensible for
 * this game or not.
 *
 * @returns A string on failure, true on success.
 *
 * @note GRAPH and NULLABLE_GRAPH types are never valid here.
 */
export function ValidateMetric(gptConfig: GamePTConfig, metricName: string, metricValue: number) {
	const scoreMetrics = GetScoreMetrics(gptConfig, ["DECIMAL", "INTEGER", "ENUM"]);

	const conf = gptConfig.providedMetrics[metricName] ?? gptConfig.derivedMetrics[metricName];

	if (!conf || !scoreMetrics.includes(metricName)) {
		return `Invalid metric ${metricName}, Expected any of ${scoreMetrics.join(", ")}.`;
	}

	if (conf.type === "ENUM") {
		return p.isBoundedInteger(0, conf.values.length - 1)(metricValue);
	}

	if (conf.type === "GRAPH" || conf.type === "NULLABLE_GRAPH") {
		return "Cannot validate a graph or nullable graph metric.";
	}

	if (conf.chartDependentMax) {
		return `This metric is chart dependent and not appropriate to check in this context.`;
	}

	return conf.validate(metricValue);
}

export function GetScoreMetricConf(gptConfig: GamePTConfig, metric: string) {
	return gptConfig.providedMetrics[metric] ?? gptConfig.derivedMetrics[metric];
}
