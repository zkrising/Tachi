import type { INTERNAL_GAME_CONFIG } from "../../types/internals";

export const GITADORA_CONF = {
	defaultPlaytype: "Dora",
	name: "GITADORA",
	validPlaytypes: ["Gita", "Dora"],
} as const satisfies INTERNAL_GAME_CONFIG;
