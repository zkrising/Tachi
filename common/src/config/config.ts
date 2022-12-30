/* eslint-disable lines-around-comment */

import { BMS_CONF } from "./game-support/bms";
import { CHUNITHM_CONF } from "./game-support/chunithm";
import { GITADORA_CONF } from "./game-support/gitadora";
import { IIDX_CONF, IIDX_DP_CONF, IIDX_SP_CONF } from "./game-support/iidx";
import { ITG_CONF } from "./game-support/itg";
import { JUBEAT_CONF } from "./game-support/jubeat";
import { MAIMAI_DX_CONF } from "./game-support/maimai-dx";
import { MUSECA_CONF } from "./game-support/museca";
import { PMS_CONF } from "./game-support/pms";
import { POPN_CONF } from "./game-support/popn";
import { SDVX_CONF } from "./game-support/sdvx";
import { USC_CONF } from "./game-support/usc";
import { WACCA_CONF } from "./game-support/wacca";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GPT_CONFIG } from "../types/internals";

const GAME_CONFIGS = {
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

// Validate the game configs that we have.
for (const [game, gameConfig] of Object.entries(GAME_CONFIGS)) {
	// @ts-expect-error not sure why TS thinks this is never, but maybe it's
	// overlapping the arrays in a funny way. either way, this is safe.
	if (!gameConfig.validPlaytypes.includes(gameConfig.defaultPlaytype)) {
		throw new Error(
			`Game configuration for ${game} is invalid. 'defaultPlaytype' is ${
				gameConfig.defaultPlaytype
			}, but the valid playtypes for this game are ${gameConfig.validPlaytypes.join(", ")}.`
		);
	}

	if (!/^[a-z]+$/u.exec(game)) {
		throw new Error(
			`The internal name '${game}' is not legal. A game's ID **must** be composed of entirely a-z characters, and must not contain any uppercase values.`
		);
	}
}

/**
 * All the games Tachi supports.
 */
export type Game = keyof typeof GAME_CONFIGS;

/**
 * What game + playtypes does Tachi support? We typically shorten this concept
 * to a "GPT", or Game+Playtype.
 *
 * The keys on the left are the games Tachi supports. The value of those keys
 * are the playtypes that game has.
 *
 * A playtype is a way of splitting a game up into sub, completely separate games.
 * A good example is the difference between IIDX SP and IIDX DP. Although they share
 * songs and a *lot* of logic, they should be completely separate when it comes to
 * storing scores and user profiles.
 *
 * For games that don't really have a meaningful concept of "playtypes", "Single"
 * is the go-to.
 */
export type Playtypes = {
	[G in Game]: typeof GAME_CONFIGS[G]["validPlaytypes"][number];
};

/**
 * Expresses any playtype (for any game). Alias for Playtypes[Game].
 */
export type Playtype = Playtypes[Game];

/**
 * GPTStrings are an internal (ish) identifier used to identify Game + Playtype combos.
 *
 * These are used in places where we want to switch over all supported game + playtype
 * combos.
 *
 * The below type magic automatically creates all combinations like iidx:SP, iidx:DP...
 * using the `Playtypes` thing above.
 */
export type GPTStrings = keyof {
	[G in Game as `${G}:${Playtypes[G]}`]: never;
};

/**
 * Configuration for the given game. This declares things like its user-facing name,
 * internal ID, defaultPlaytype and what playtypes it supports.
 */
export interface GameConfig<G extends Game = Game> {
	readonly internalName: G;
	readonly name: string;
	readonly defaultPlaytype: Playtypes[G];
	readonly validPlaytypes: ReadonlyArray<Playtypes[G]>;
}

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
export function GetGPTString(game: Game, playtype: Playtype): GPTStrings {
	return `${game}:${playtype}` as GPTStrings;
}

const GAME_PT_CONFIGS = {
	"iidx:SP": IIDX_SP_CONF,
	"iidx:DP": IIDX_DP_CONF,
} as const satisfies Record<GPTStrings, INTERNAL_GPT_CONFIG>;

/**
 * Returns the configuration for this Game + Playtype.
 * Optionally, a generic parameter - GPTString - can be passed
 * to indicate what GPTString this configuration is for.
 */
export function GetGamePTConfig<GPT extends GPTStrings = GPTStrings>(
	game: Game,
	playtype: Playtypes[Game]
): GamePTConfig<GPT> {
	const gptString = GetGPTString(game, playtype);

	return GAME_PT_CONFIGS[gptString] as unknown as GamePTConfig<GPT>;
}

export const allSupportedGames = Object.keys(GAME_CONFIGS) as Array<Game>;
export const allGPTStrings = Object.keys(GAME_PT_CONFIGS) as Array<GPTStrings>;
