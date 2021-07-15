import { StaticConfig } from "tachi-common";

export const mode = process.env.REACT_APP_TCHIC_MODE;

if (!mode) {
	throw new Error("No TCHIC_MODE set. Cannot boot.");
}

let conf;

if (mode === "ktchi") {
	conf = StaticConfig.KTCHI_CONFIG;
} else if (mode === "btchi") {
	conf = StaticConfig.BTCHI_CONFIG;
} else if (mode === "omni") {
	conf = StaticConfig.OMNI_CONFIG;
} else {
	throw new Error(`Invalid TCHIC_MODE of ${mode}. Cannot boot.`);
}

export const TachiConfig = conf;
