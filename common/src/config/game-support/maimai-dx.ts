import type { INTERNAL_GAME_CONFIG } from "../../types/internals";

export const MAIMAI_DX_CONF = {
	defaultPlaytype: "Single",
	name: "maimai DX",
	validPlaytypes: ["Single"],
} as const satisfies INTERNAL_GAME_CONFIG;
