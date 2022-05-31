// Note that Version Info is intentionally identical between all variants of tachi
// viz. btchi and ktchi share versioning. This is because they
// essentially share codebases.
import CreateLogCtx from "lib/logger/logger";
import semver from "semver";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// As is with all front-facing zkldi projects, the version names for tachi-server
// are from an album I like. In this case, the album is Portishead - Dummy.
// The fact that this album is very similar to Mezzanine
// - the album used for Kamaitachi v1 - is deliberate. :) - zkldi
const PORTISHEAD_DUMMY = [
	// v2.0.0
	"Mysterons",

	// v2.1.0
	"Sour Times",

	// v2.2.0
	"Strangers",

	// v2.3.0
	"It Could Be Sweet",

	// v2.4.0
	"Wandering Star",

	// v2.5.0
	"It's a Fire",

	// v2.6.0
	"Numb",

	// v2.7.0
	"Roads",

	// v2.8.0
	"Pedestal",

	// v2.9.0
	"Biscuit",

	// v2.10.0
	"Glory Box",

	// v2.11+ onwards are not expected to occur, but if they do, we'll figure something out.
];

const logger = CreateLogCtx(__filename);

const packageJSON = JSON.parse(
	fs.readFileSync(path.join(__dirname, "../../../package.json"), "utf-8")
) as { version: string };

const semverInfo = semver.parse(packageJSON.version);

if (!semverInfo) {
	logger.warn(
		`Couldn't parse semverInfo out of package.json? Got a string of '${packageJSON.version}', but couldn't parse. Defaulting to 0.`
	);
}

let commit: string | null = null;

try {
	// This fetches the HEAD of our current running branch. This is useful for debugging.
	// Note that git returns this with a trailing newline, so we have to trim that off.
	commit = execSync("git rev-parse --short HEAD").toString("utf-8").trim();
} catch (err) {
	logger.warn(`Failed to read what commit we're on -- Using null as our commit version.`, {
		err,
	});
}

export const VERSION_INFO = {
	major: semverInfo?.major ?? 0,
	minor: semverInfo?.minor ?? 0,
	patch: semverInfo?.patch ?? 0,
	commit,
	name: PORTISHEAD_DUMMY[semverInfo?.minor ?? 0] ?? "No Version Name",
};

export const VERSION_STR = semverInfo?.raw ?? "0.0.0-unknown";

export const VERSION_PRETTY = `v${VERSION_STR} (${VERSION_INFO.name}) [${commit}]`;
