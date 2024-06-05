// Note that Version Info is intentionally identical between all variants of tachi
// viz. boku and kamai share versioning. This is because they
// essentially share codebases.
import CreateLogCtx from "lib/logger/logger";
import { Environment } from "lib/setup/config";
import semver from "semver";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const logger = CreateLogCtx(__filename);

// we want to read the monorepo root package.json.
const packageJSON = JSON.parse(
	fs.readFileSync(path.join(__dirname, "../../../../package.json"), "utf-8")
) as { version: string };

const semverInfo = semver.parse(packageJSON.version);

if (!semverInfo) {
	logger.warn(
		`Couldn't parse semverInfo out of package.json? Got a string of '${packageJSON.version}', but couldn't parse. Defaulting to v0.0.0-unknown.`
	);
}

let commit: string | null = null;

try {
	if (Environment.commitHash) {
		commit = Environment.commitHash;
	} else {
		// This fetches the HEAD of our current running branch. This is useful for debugging.
		// Note that git returns this with a trailing newline, so we have to trim that off.
		commit = execSync("git rev-parse --short HEAD").toString("utf-8").trim();
	}
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
};

export const VERSION_STR = semverInfo?.raw ?? "0.0.0-unknown";

export const VERSION_PRETTY = `v${VERSION_STR} [${commit}]`;
