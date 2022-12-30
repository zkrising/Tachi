import type { INTERNAL_GAME_CONFIG } from "../../types/internals";

export const USC_CONF = {
	defaultPlaytype: "Controller",
	name: "USC",
	validPlaytypes: ["Controller", "Keyboard"],
} as const satisfies INTERNAL_GAME_CONFIG;
