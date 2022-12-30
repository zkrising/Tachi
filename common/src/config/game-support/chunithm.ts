import type { INTERNAL_GAME_CONFIG } from "../../types/internals";

export const CHUNITHM_CONF = {
	defaultPlaytype: "Single",
	name: "CHUNITHM",
	validPlaytypes: ["Single"],
} as const satisfies INTERNAL_GAME_CONFIG;
