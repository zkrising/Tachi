import type { INTERNAL_GAME_CONFIG } from "../../types/internals";

export const WACCA_CONF = {
	defaultPlaytype: "Single",
	name: "WACCA",
	validPlaytypes: ["Single"],
} as const satisfies INTERNAL_GAME_CONFIG;
