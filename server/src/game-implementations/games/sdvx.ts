import {
	SDVXLIKE_CLASS_DERIVERS,
	SDVXLIKE_DEFAULT_MERGE_NAME,
	SDVXLIKE_DERIVERS,
	SDVXLIKE_GOAL_FMT,
	SDVXLIKE_GOAL_OO_FMT,
	SDVXLIKE_GOAL_PG_FMT,
	SDVXLIKE_PB_MERGERS,
	SDVXLIKE_PROFILE_CALCS,
	SDVXLIKE_SCORE_CALCS,
	SDVXLIKE_SESSION_CALCS,
} from "./_common";
import type { GPTServerImplementation } from "game-implementations/types";

export const SDVX_IMPL: GPTServerImplementation<"sdvx:Single"> = {
	derivers: SDVXLIKE_DERIVERS,
	validators: {
		exScore: (exScore, chart) => {
			if (exScore < 0) {
				return `EX Score must be non-negative. Got ${exScore}`;
			}

			// TODO
			// gotta figure this out somehow?
			// we need to store notecounts or something. For now, just allow
			// any +ve integer, I guess.

			return true;
		},
	},
	scoreCalcs: SDVXLIKE_SCORE_CALCS,
	sessionCalcs: SDVXLIKE_SESSION_CALCS,
	profileCalcs: SDVXLIKE_PROFILE_CALCS,
	classDerivers: SDVXLIKE_CLASS_DERIVERS,
	goalCriteriaFormatters: SDVXLIKE_GOAL_FMT,
	goalProgressFormatters: SDVXLIKE_GOAL_PG_FMT,
	goalOutOfFormatters: SDVXLIKE_GOAL_OO_FMT,
	pbMergeFunctions: SDVXLIKE_PB_MERGERS,
	defaultMergeRefName: SDVXLIKE_DEFAULT_MERGE_NAME,
};
