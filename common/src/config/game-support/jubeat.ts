import type { INTERNAL_GAME_CONFIG } from "../../types/internals";

export const JUBEAT_CONF = {
	defaultPlaytype: "Single",
	name: "jubeat",
	validPlaytypes: ["Single"],
} as const satisfies INTERNAL_GAME_CONFIG;
