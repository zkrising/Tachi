import {
	SDVXLIKE_DERIVERS,
	SDVXLIKE_SCORE_CALCS,
	SDVXLIKE_SESSION_CALCS,
	SDVXLIKE_PROFILE_CALCS,
	SDVXLIKE_CLASS_DERIVERS,
	SDVXLIKE_GOAL_FMT,
	SDVXLIKE_GOAL_PG_FMT,
} from "./_common";
import type { GPTServerImplementation } from "game-implementations/types";
import type { GPTStrings } from "tachi-common";

const USC_IMPL: GPTServerImplementation<GPTStrings["usc"]> = {
	derivers: SDVXLIKE_DERIVERS,
	validators: {},
	scoreCalcs: SDVXLIKE_SCORE_CALCS,
	sessionCalcs: SDVXLIKE_SESSION_CALCS,
	profileCalcs: SDVXLIKE_PROFILE_CALCS,
	classDerivers: SDVXLIKE_CLASS_DERIVERS,
	goalCriteriaFormatters: SDVXLIKE_GOAL_FMT,
	goalProgressFormatters: SDVXLIKE_GOAL_PG_FMT,
};

export const USC_KEYBOARD_IMPL: GPTServerImplementation<"usc:Keyboard"> = USC_IMPL;

export const USC_CONTROLLER_IMPL: GPTServerImplementation<"usc:Controller"> = USC_IMPL;
