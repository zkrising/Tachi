import type { INTERNAL_GAME_CONFIG } from "../../types/internals";

export const PMS_CONF = {
	defaultPlaytype: "Controller",
	name: "PMS",
	validPlaytypes: ["Controller", "Keyboard"],
} as const satisfies INTERNAL_GAME_CONFIG;
