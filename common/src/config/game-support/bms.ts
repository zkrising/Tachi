import type { INTERNAL_GAME_CONFIG } from "../../types/internals";

export const BMS_CONF = {
	defaultPlaytype: "7K",
	name: "BMS",
	validPlaytypes: ["7K", "14K"],
} as const satisfies INTERNAL_GAME_CONFIG;
