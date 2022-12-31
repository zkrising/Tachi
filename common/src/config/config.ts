/* eslint-disable lines-around-comment */

import { BMS_14K_CONF, BMS_7K_CONF, BMS_CONF } from "./game-support/bms";
import { CHUNITHM_CONF, CHUNITHM_SINGLE_CONF } from "./game-support/chunithm";
import { GITADORA_CONF, GITADORA_DORA_CONF, GITADORA_GITA_CONF } from "./game-support/gitadora";
import { IIDX_CONF, IIDX_DP_CONF, IIDX_SP_CONF } from "./game-support/iidx";
import { ITG_CONF, ITG_STAMINA_CONF } from "./game-support/itg";
import { JUBEAT_CONF, JUBEAT_SINGLE_CONF } from "./game-support/jubeat";
import { MAIMAI_DX_CONF, MAIMAI_DX_SINGLE_CONF } from "./game-support/maimai-dx";
import { MUSECA_CONF, MUSECA_SINGLE_CONF } from "./game-support/museca";
import { PMS_CONF, PMS_CONTROLLER_CONF, PMS_KEYBOARD_CONF } from "./game-support/pms";
import { POPN_9B_CONF, POPN_CONF } from "./game-support/popn";
import { SDVX_CONF, SDVX_SINGLE_CONF } from "./game-support/sdvx";
import { USC_CONF, USC_CONTROLLER_CONF, USC_KEYBOARD_CONF } from "./game-support/usc";
import { WACCA_CONF, WACCA_SINGLE_CONF } from "./game-support/wacca";
import type {
	GPTString,
	Game,
	GameConfig,
	GamePTConfig,
	Playtype,
	Playtypes,
} from "../types/game-support";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GPT_CONFIG } from "../types/internals";

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
	maimaidx: MAIMAI_DX_CONF,
	popn: POPN_CONF,
	sdvx: SDVX_CONF,
	usc: USC_CONF,
	wacca: WACCA_CONF,
	pms: PMS_CONF,
	itg: ITG_CONF,
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
	"maimaidx:Single": MAIMAI_DX_SINGLE_CONF,
	"pms:Controller": PMS_CONTROLLER_CONF,
	"pms:Keyboard": PMS_KEYBOARD_CONF,
	"usc:Controller": USC_CONTROLLER_CONF,
	"usc:Keyboard": USC_KEYBOARD_CONF,
	"itg:Stamina": ITG_STAMINA_CONF,
} as const satisfies Record<GPTString, INTERNAL_GPT_CONFIG>;

/**
 * Returns the configuration for this Game + Playtype.
 * Optionally, a generic parameter - GPTString - can be passed
 * to indicate what GPTString this configuration is for.
 */
export function GetGamePTConfig<GPT extends GPTString = GPTString>(
	game: Game,
	playtype: Playtypes[Game]
): GamePTConfig<GPT> {
	const gptString = GetGPTString(game, playtype);

	return GAME_PT_CONFIGS[gptString] as unknown as GamePTConfig<GPT>;
}

export const allSupportedGames = Object.keys(GAME_CONFIGS) as Array<Game>;
export const allGPTStrings = Object.keys(GAME_PT_CONFIGS) as Array<GPTString>;
