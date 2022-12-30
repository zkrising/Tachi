import type { INTERNAL_GAME_CONFIG } from "../../types/internals";

export const ITG_CONF = {
	defaultPlaytype: "Stamina",
	name: "ITG",
	validPlaytypes: ["Stamina"],
} as const satisfies INTERNAL_GAME_CONFIG;
