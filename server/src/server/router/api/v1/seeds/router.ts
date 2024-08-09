import { Router } from "express";
import { PullDatabaseSeeds } from "lib/database-seeds/repo";
import CreateLogCtx from "lib/logger/logger";
import { Environment } from "lib/setup/config";
import prValidate from "server/middleware/prudence-validate";
import { RequireLocalDevelopment } from "server/middleware/type-require";
import { GetCommit, ListGitCommitsInPath } from "utils/git";
import { asyncExec, IsString } from "utils/misc";
import fsSync from "fs";
import fs from "fs/promises";
import path from "path";

const logger = CreateLogCtx(__filename);

// Routes for interacting with the `database-seeds` folder in this instance of Tachi.

// Why do we have this, and why is it limited to only local development?
// The answer is that we have a "Seeds UI" that runs in the client. For local development
// it's useful to be able to see the current state of the seeds on-disk, and diff that
// against various local commits. As such, we need an api such that the client can
// interface with our local seeds.

// In production/staging, we use GitHub as a source of truth for our git repository.
// In local dev, we have this option available too, but we also enable this API.

const router: Router = Router({ mergeParams: true });

router.use(RequireLocalDevelopment);

// there's a lady who's sure
// all that glitters is gold
const LOCAL_DEV_SEEDS_PATH = path.join(
	__dirname,

	// and she's buying a...
	"../../../../../../../database-seeds/collections"
);
const TEST_SEEDS_PATH = path.join(__dirname, "../../../../../test-utils/mock-db");

const LOCAL_SEEDS_PATH = Environment.nodeEnv === "test" ? TEST_SEEDS_PATH : LOCAL_DEV_SEEDS_PATH;

if (Environment.nodeEnv === "dev" || Environment.nodeEnv === "test") {
	if (!fsSync.existsSync(LOCAL_SEEDS_PATH)) {
		logger.error(
			`Failed to load seeds routes, could not find any database-seeds/collections checked out at ${LOCAL_SEEDS_PATH}.
These were expected to be present as this is local-development!
All seeds routes will return 500.`
		);
	}
}

/**
 * No-Op route for checking whether this feature is supported by this instance of Tachi.
 *
 * @name GET /api/v1/seeds
 */
router.get("/", (req, res) => {
	return res.status(200).json({
		success: true,
		description: `Local seeds are available on this instance of Tachi.`,
		body: {},
	});
});

/**
 * Check whether there are changes to the database-seeds in this local development
 * instance that have not been committed yet.
 *
 * @name GET /api/v1/seeds/has-uncommitted-changes
 */
router.get("/has-uncommitted-changes", async (req, res) => {
	const { stdout, stderr } = await asyncExec(`git status --porcelain`);

	if (stderr) {
		logger.error(`Failed to read git status --porcelain.`, { stderr });
		return res.status(500).json({
			success: false,
			description: `Failed to check current git status.`,
		});
	}

	// if any change contains database-seeds/collections, it's probably uncommitted
	// local changes.
	const hasUncommittedChanges = stdout
		.split("\n")

		// note that doing this properly is frustrating. This has false positives for
		// routes that partially contain this route. I've ameliorated this slightly with
		// a leading space, but that is not a proper solution.
		.some((row) => / database-seeds\/collections/u.exec(row));

	return res.status(200).json({
		success: true,
		description: hasUncommittedChanges
			? "This local instance has uncommitted changes."
			: "This local instance does not have uncommitted changes.",
		body: hasUncommittedChanges,
	});
});

/**
 * List commits that have affected seeds.
 *
 * This format is a partial implementation of what GitHub's REST API returns. As such,
 * an implementing client has far less work to do with respect to handling local + remote
 * servers.
 *
 * @param file - If provided, only returns commits that have touched this specific file.
 *
 * @name GET /api/v1/seeds/commits
 */
router.get(
	"/commits",
	prValidate({
		branch: "string",
		file: "*string",
	}),
	async (req, res) => {
		// validated by prudence.
		const file = req.query.file as string | undefined;
		const branch = req.query.branch as string;

		const seeds = await PullDatabaseSeeds();
		const collections = (await seeds.ListCollections()).map((e) => `${e}.json`);

		if (IsString(file) && !collections.includes(file)) {
			return res.status(400).json({
				success: false,
				description: `Invalid file of '${file}' requested. Expected any of ${collections.join(
					", "
				)}`,
			});
		}

		// if we don't have a file, use the do-nothing path.
		const realFile = file ?? ".";

		// only check commits in database-seeds/collections
		const commits = await ListGitCommitsInPath(
			branch,
			path.join("database-seeds", "collections", realFile)
		);

		return res.status(200).json({
			success: true,
			description: `Found ${commits.length} commits.`,
			body: commits,
		});
	}
);

/**
 * List branches available on this local repository.
 *
 * This returns all branches under `branches`, and the currently selected branch
 * as `checkedout`, which might be null if the HEAD is currently detached.
 *
 * @name GET /api/v1/seeds/branches
 */
router.get("/branches", async (req, res) => {
	const { stdout: branches } = await asyncExec(`PAGER=cat git branch --no-color -v`);

	const allBranches = [];
	let currentBranch: { name: string; sha: string } | null = null;

	for (const branchStr of branches.split("\n")) {
		const match = /^ *(\*?) +(.*?) +([a-f0-9]*)/u.exec(branchStr) as
			| [string, string, string, string]
			| null;

		if (match === null) {
			continue;
		}

		const [_, isCurrent, branchName, sha] = match;

		if (branchName.startsWith("(HEAD detatched at")) {
			continue;
		}

		if (branchName === "") {
			continue;
		}

		const branch = { name: branchName, sha };

		if (isCurrent === "*") {
			currentBranch = branch;
		}

		allBranches.push(branch);
	}

	return res.status(200).json({
		success: true,
		description: `Found ${allBranches.length} branches.`,
		body: {
			branches: allBranches,
			current: currentBranch,
		},
	});
});

/**
 * Retrieve the current state of the collection as of this revision.
 *
 * This returns a record of "songs-iidx.json" -> PARSED_SONGS_IIDX_JSON_CONTENT
 * for all collections as of that current revision. As such, you should treat all
 * returned records as if they might not be present (as they might not be).
 *
 * @param revision - The revision fetched. This is resolved using standard git rules,
 * and can therefore be a branch name, a commit name, or anything else git will resolve
 * like HEAD@{2020-01-01}.
 *
 * If no revision is provided, the current uncommitted state on disk is returned instead.
 *
 * @name GET /api/v1/seeds/collections
 */
router.get(
	"/collections",
	prValidate({
		revision: "*string",
	}),
	async (req, res) => {
		// asserted by prudence
		const rev = req.query.revision as string | undefined;

		const data: Record<string, unknown> = {};

		// use local disk
		if (rev === undefined) {
			const files = await fs.readdir(LOCAL_SEEDS_PATH);

			await Promise.all(
				files.map(async (file) => {
					const content = await fs.readFile(path.join(LOCAL_SEEDS_PATH, file), "utf-8");

					data[file] = JSON.parse(content);
				})
			);
		} else {
			// we have a revision.

			if (rev.includes(":")) {
				return res.status(400).json({
					success: false,
					description: `Git Revisions cannot contain ':' characters.`,
				});
			}

			// @warn we don't actually bother doing any real shell
			// escaping here, since these routes are only enabled in local development.
			const { stdout: fileStdout } = await asyncExec(
				`PAGER=cat git show '${rev}:database-seeds/collections' | tail -n +3`
			);

			// @warn this breaks for files that have newlines in
			// I don't care.
			// also, this ends with a trailing newline which means we get a trailing
			// empty filename, gotta strip that out.
			const files = fileStdout.split("\n").filter((e) => e !== "");

			await Promise.all(
				files.map(async (file) => {
					// git show fails with 128 *if* this file doesn't exist at the time
					// of this commit. however, the files we're iterating over are the
					// files in the collection as of this commit, so, this should never
					// crash in that way, right?
					const { stdout: content } = await asyncExec(
						`PAGER=cat git show '${rev}:database-seeds/collections/${file}'`
					);

					data[file] = JSON.parse(content);
				})
			);
		}

		return res.status(200).json({
			success: true,
			description: `Retrieved data ${rev ? `as of ${rev}` : "off of the current disk"}.`,
			body: data,
		});
	}
);

/**
 * Retrieve information about the provided commit.
 *
 * @param sha - The commit to fetch information about. Technically, this can be the name
 * of any git object, but you probably shouldn't.
 *
 * @name GET /api/v1/seeds/commit
 */
router.get(
	"/commit",
	prValidate({
		sha: "string",
	}),
	async (req, res) => {
		// asserted by prudence
		const sha = req.query.sha as string;

		try {
			const commit = await GetCommit(sha);

			return res.status(200).json({
				success: true,
				description: `Found commit '${sha}'.`,
				body: commit,
			});
		} catch (err) {
			logger.info(`Failed to fetch commit.`, { err });
			return res.status(404).json({
				success: false,
				description: `Failed to fetch commit. It may not exist.`,
			});
		}
	}
);

export default router;
