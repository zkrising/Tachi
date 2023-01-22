import {
	SDVXLIKE_DERIVERS,
	SDVXLIKE_SCORE_CALCS,
	SDVXLIKE_SESSION_CALCS,
	SDVXLIKE_PROFILE_CALCS,
	SDVXLIKE_CLASS_DERIVERS,
	SDVXLIKE_GOAL_FMT,
	SDVXLIKE_GOAL_PG_FMT,
	SDVXLIKE_GOAL_OO_FMT,
	SDVXLIKE_DEFAULT_MERGE_NAME,
	SDVXLIKE_PB_MERGERS,
	SDVXLIKE_SCORE_VALIDATORS,
} from "./_common";
import type { GPTServerImplementation } from "game-implementations/types";
import type { GPTStrings } from "tachi-common";

const USC_IMPL: GPTServerImplementation<GPTStrings["usc"]> = {
	derivers: SDVXLIKE_DERIVERS,
	chartSpecificValidators: {},
	scoreCalcs: SDVXLIKE_SCORE_CALCS,
	sessionCalcs: SDVXLIKE_SESSION_CALCS,
	profileCalcs: SDVXLIKE_PROFILE_CALCS,
	classDerivers: SDVXLIKE_CLASS_DERIVERS,
	goalCriteriaFormatters: SDVXLIKE_GOAL_FMT,
	goalProgressFormatters: SDVXLIKE_GOAL_PG_FMT,
	goalOutOfFormatters: SDVXLIKE_GOAL_OO_FMT,
	pbMergeFunctions: SDVXLIKE_PB_MERGERS,
	defaultMergeRefName: SDVXLIKE_DEFAULT_MERGE_NAME,
	scoreValidators: SDVXLIKE_SCORE_VALIDATORS,
};

export const USC_KEYBOARD_IMPL: GPTServerImplementation<"usc:Keyboard"> = USC_IMPL;

export const USC_CONTROLLER_IMPL: GPTServerImplementation<"usc:Controller"> = USC_IMPL;
