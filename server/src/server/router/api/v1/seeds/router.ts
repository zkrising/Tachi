import { Router } from "express";
import { PullDatabaseSeeds } from "lib/database-seeds/repo";
import CreateLogCtx from "lib/logger/logger";
import { Environment } from "lib/setup/config";
import prValidate from "server/middleware/prudence-validate";
import { RequireLocalDevelopment } from "server/middleware/type-require";
import { ListGitCommitsInPath } from "utils/git";
import { asyncExec, IsString } from "utils/misc";
import fs from "fs";
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
	if (!fs.existsSync(LOCAL_SEEDS_PATH)) {
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
		file: "*string",
	}),
	async (req, res) => {
		// validated by prudence.
		const file = req.query.file as string | undefined;

		const seeds = await PullDatabaseSeeds(LOCAL_SEEDS_PATH);
		const collections = await seeds.ListCollections();

		if (IsString(file)) {
			// @ts-expect-error it's complaining because collections
			// and string might not have overlap; fair enough, but the point of this
			// test is to check that!
			if (!collections.includes(file)) {
				return res.status(400).json({
					success: false,
					description: `Invalid file of '${file}' requested. Expected any of ${collections.join(
						", "
					)}`,
				});
			}
		}

		// if we have a file, suffix it with .json
		// otherwise, use the do-nothing path.
		const realFile = file ? `${file}.json` : ".";

		// only check commits in database-seeds/collections
		const commits = await ListGitCommitsInPath(
			path.join("database-seeds", "collections", realFile)
		);

		return res.status(200).json({
			success: true,
			description: `Found ${commits.length} commits.`,
			body: commits,
		});
	}
);

export default router;
