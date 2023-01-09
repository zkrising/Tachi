import { IIDXLIKE_DERIVERS, IIDXLIKE_VALIDATORS, SGLCalc } from "./_common";
import { ProfileAvgBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import type { GPTServerImplementation } from "game-implementations/types";
import type { GPTStrings } from "tachi-common";

// bms and pms currently have *identical*
// implementations. Nice.

const BMS_IMPL: GPTServerImplementation<GPTStrings["bms" | "pms"]> = {
	derivers: IIDXLIKE_DERIVERS,
	validators: IIDXLIKE_VALIDATORS,
	scoreCalcs: { sieglinde: SGLCalc },
	sessionCalcs: { sieglinde: SessionAvgBest10For("sieglinde") },
	profileCalcs: { sieglinde: ProfileAvgBestN("sieglinde", 20) },
	classDerivers: {},
};

export const BMS_14K_IMPL: GPTServerImplementation<"bms:14K"> = BMS_IMPL;

export const BMS_7K_IMPL: GPTServerImplementation<"bms:7K"> = BMS_IMPL;

export const PMS_CONTROLLER_IMPL: GPTServerImplementation<"pms:Controller"> = BMS_IMPL;
export const PMS_KEYBOARD_IMPL: GPTServerImplementation<"pms:Keyboard"> = BMS_IMPL;
