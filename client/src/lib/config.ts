import { Game, ImportTypes } from "tachi-common";
import { allImportTypes, allSupportedGames } from "tachi-common/js/config/static-config";

export const mode = process.env.REACT_APP_TCHIC_MODE;

if (!mode) {
	throw new Error("No REACT_APP_TCHIC_MODE set in Process Environment, refusing to boot.");
}

let conf: {
	name: string;
	type: "ktchi" | "btchi" | "omni";
	supportedGames: Game[];
	importTypes: ImportTypes[];
};
let colourConf;

if (mode === "ktchi") {
	conf = {
		name: "Kamaitachi",
		type: "ktchi",
		// TODO: #78 This should inherit in some way from the server config. Can we reflect
		// this out somehow?
		supportedGames: ["iidx", "chunithm", "museca", "sdvx", "wacca", "popn", "jubeat"],
		importTypes: [
			"api/arc-iidx",
			"api/arc-sdvx",
			"api/eag-iidx",
			"api/eag-sdvx",
			"api/flo-iidx",
			"api/flo-sdvx",
			"api/min-sdvx",
			"ir/direct-manual",
			"ir/fervidex",
			"ir/fervidex-static",
			"file/eamusement-iidx-csv",
			"file/eamusement-sdvx-csv",
			"file/solid-state-squad",
			"file/pli-iidx-csv",
		],
	};
	colourConf = {
		primary: "#e61c6e",
	};
} else if (mode === "btchi") {
	conf = {
		name: "Bokutachi",
		type: "btchi",
		supportedGames: ["bms", "usc"],
		importTypes: ["ir/beatoraja", "ir/usc", "ir/direct-manual", "file/batch-manual"],
	};
	colourConf = {
		primary: "#4974a5",
	};
} else if (mode === "omni") {
	conf = {
		name: "Omnitachi",
		type: "omni",
		supportedGames: allSupportedGames,
		importTypes: allImportTypes,
	};
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
