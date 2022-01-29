import { Game, ImportTypes } from "tachi-common";
import { allImportTypes, allSupportedGames } from "tachi-common/js/config/static-config";
// @ts-expect-error No types available...
import syncFetch from "sync-fetch";
import { ToAPIURL } from "util/api";

export const mode = process.env.REACT_APP_TCHIC_MODE;

if (!mode) {
	throw new Error("No REACT_APP_TCHIC_MODE set in Process Environment, refusing to boot.");
}

export interface TachiConfig {
	name: string;
	type: "ktchi" | "btchi" | "omni";
	games: Game[];
	importTypes: ImportTypes[];
}

let configRes;
try {
	configRes = syncFetch(ToAPIURL("/config")).json();

	if (!configRes.success) {
		throw new Error(`Failed to fetch config -- ${configRes.description}.`);
	}
} catch (err) {
	throw new Error(`Site is (probably) down. Sorry. (${(err as Error).message})`);
}

const conf: TachiConfig = configRes.body;
let colourConf;

if (mode === "ktchi") {
	colourConf = {
		primary: "#e61c6e",
	};
} else if (mode === "btchi") {
	colourConf = {
		primary: "#4974a5",
	};
} else if (mode === "omni") {
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
