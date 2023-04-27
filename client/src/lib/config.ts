import { ToAPIURL } from "util/api";
import { Game, ImportTypes } from "tachi-common";
// @ts-expect-error No types available...
import syncFetch from "sync-fetch";

export const mode = process.env.VITE_TCHIC_MODE;

if (!mode) {
	throw new Error("No VITE_TCHIC_MODE set in Process Environment, refusing to boot.");
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
	document.open();
	document.write(`
	<style>
		html {
			width: 100%;
			height: 100%;
			overflow: hidden;
		}
		.box {
			display: flex;
			justify-content: center;
			width: 100%;
			height: 100%;
			align-items: center;
			margin: 0;
			padding: 0;
			inset: 0;
			flex-direction: column;
			text-align: center;
			font-family: system-ui, -apple-system, sans-serif;
			position: absolute;
		}	
		ul {
			text-align: left;
		}
	</style>
	<div class="box">
		<h1>Failed to connect!</h1>
		<div style="max-width: 720px">Welp. Looks like we're down. Sorry about that.</div>
		<div>Chances are, this is just a temporary outage and will be fixed soon.</div>
		<div style="font-size: 1.25rem; margin-top: 1rem; margin-bottom: 1rem;">
			Please be patient, <a href="https://github.com/TNG-dev/Tachi">Tachi is maintained by a very small team.</a>
		</div>
		<div>An error message can be found in the console. (<code>Ctrl-Shift-I</code>)</div>
		${
			process.env.VITE_IS_LOCAL_DEV
				? `
			<div style="max-width: 720px; margin-top: 1.75em"><b>You're in local development mode.</b>
			<p style="font-size: 1.75rem;">
				Have you accepted the HTTPS certificates for <a href="${ToAPIURL(
					"/status"
				)}">the server?</a> If not, the site won't load.
			</p>
		`
				: ""
		}
	</div>
	`);
	document.close();
	// alert(`Fatal Error: Site is (probably) down. Sorry. (${(err as Error).message})`);
	throw new Error(`Site is (probably) down. Sorry. (${(err as Error).message})`);
}

const conf: TachiConfig = configRes.body;
const colourConf = {
	background: "#131313",
	lightground: "#2b292b",
	backestground: "#000000",
	overground: "#524e52",
	primary: "#000",
};

if (mode === "ktchi") {
	colourConf.primary = "#e61c6e";
} else if (mode === "btchi") {
	colourConf.primary = "#4974a5";
} else if (mode === "omni") {
	colourConf.primary = "#e61c6e";
} else {
	throw new Error("Invalid VITE_TCHIC_MODE. Expected ktchi, btchi or omni.");
}

export const TachiConfig = conf;
export const ColourConfig = colourConf;
export const ClientConfig = {
	MANDATE_LOGIN: process.env.VITE_TCHIC_MODE === "ktchi" || process.env.VITE_MANDATE_LOGIN,
};
