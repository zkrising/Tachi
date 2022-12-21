import { ToAPIURL } from "util/api";
import { Game, ImportTypes } from "tachi-common";
// @ts-expect-error No types available...
import syncFetch from "sync-fetch";

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
	document.write(`
	<style>
		.box {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100vw;
			height: 100vh;
			flex-direction: column;
			text-align: center;
			position: absolute;
		}

		ul {
			text-align: left;
		}
	</style>
	<div class="box">
		<h1>Failed to connect!</h1>
		<div>Welp. Looks like we're down. Sorry about that.</div>
		<div>Chances are, this is just a temporary outage and will be fixed soon.</div>
		<div style="font-size: 1.25rem; margin-top: 1rem; margin-bottom: 1rem;">
			Please be patient, <a href="https://github.com/TNG-dev/Tachi">Tachi is maintained by a very small team.</a>
		</div>
		<div>An error message can be found in the console. (<code>Ctrl-Shift-K</code>)</div>
		${
			process.env.REACT_APP_IS_LOCAL_DEV
				? `
			<hr />
			<div><b>You're in local development mode.</b>
			<ul>
				<li>Have you accepted the HTTPS certificates for <a href="${ToAPIURL(
					"/"
				)}">the server?</a>. If not, the site won't load.</li>
				<li>Failing that, have you made sure to start the server with <code>pnpm start-server</code>?</li>
			</ul>
		`
				: ""
		}
	</div>
	`);
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
	throw new Error("Invalid REACT_APP_TCHIC_MODE. Expected ktchi, btchi or omni.");
}

export const TachiConfig = conf;
export const ColourConfig = colourConf;
export const ClientConfig = {
	MANDATE_LOGIN:
		process.env.REACT_APP_TCHIC_MODE === "ktchi" || process.env.REACT_APP_MANDATE_LOGIN,
};
