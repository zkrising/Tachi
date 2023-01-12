import {
	SDVXLIKE_CLASS_DERIVERS,
	SDVXLIKE_DERIVERS,
	SDVXLIKE_GOAL_FMT,
	SDVXLIKE_GOAL_PG_FMT,
	SDVXLIKE_PROFILE_CALCS,
	SDVXLIKE_SCORE_CALCS,
	SDVXLIKE_SESSION_CALCS,
} from "./_common";
import type { GPTServerImplementation } from "game-implementations/types";

export const SDVX_IMPL: GPTServerImplementation<"sdvx:Single"> = {
	derivers: SDVXLIKE_DERIVERS,
	validators: {
		exScore: (exScore, chart) => {
			// TODO
			// gotta figure this out somehow?
			throw new Error(`Unimplemented.`);
		},
	},
	scoreCalcs: SDVXLIKE_SCORE_CALCS,
	sessionCalcs: SDVXLIKE_SESSION_CALCS,
	profileCalcs: SDVXLIKE_PROFILE_CALCS,
	classDerivers: SDVXLIKE_CLASS_DERIVERS,
	goalCriteriaFormatters: SDVXLIKE_GOAL_FMT,
	goalProgressFormatters: SDVXLIKE_GOAL_PG_FMT,
};
