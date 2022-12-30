import type { INTERNAL_GAME_CONFIG } from "../../types/internals";

export const POPN_CONF = {
	defaultPlaytype: "9B",
	name: "pop'n music",
	validPlaytypes: ["9B"],
} as const satisfies INTERNAL_GAME_CONFIG;
