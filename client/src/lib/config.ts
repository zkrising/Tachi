import { StaticConfig } from "tachi-common";

export const mode = process.env.REACT_APP_TCHIC_MODE;

if (!mode) {
	throw new Error("No REACT_APP_TCHIC_MODE set in Process Environment, refusing to boot.");
}

let conf;
let colourConf;

if (mode === "ktchi") {
	conf = StaticConfig.KTCHI_CONFIG;
	colourConf = {
		primary: "#e61c6e",
	};
} else if (mode === "btchi") {
	conf = StaticConfig.BTCHI_CONFIG;
	colourConf = {
		primary: "#4974a5",
	};
} else if (mode === "omni") {
	conf = StaticConfig.OMNI_CONFIG;
	colourConf = {
		primary: "#e61c6e",
	};
} else {
	throw new Error("Invalid REACT_APP_TCHIC_MODE. Expected ktchi, btchi or omni.");
}

export const TachiConfig = conf;
export const ColourConfig = colourConf;
export const ClientConfig = {
	MANDATE_LOGIN:
		process.env.REACT_APP_TCHIC_MODE === "ktchi" || process.env.REACT_APP_MANDATE_LOGIN,
};
