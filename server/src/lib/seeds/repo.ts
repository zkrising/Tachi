/* eslint-disable no-await-in-loop */
import CreateLogCtx from "lib/logger/logger";
import { Environment, ServerConfig } from "lib/setup/config";
import { asyncExec } from "utils/misc";
import fs from "fs/promises";
import os from "os";
import path from "path";
import type { ICollection } from "monk";
import type { Game } from "tachi-common";

const logger = CreateLogCtx(__filename);

export type SeedsCollections =
	| "bms-course-lookup"
	| "folders"
	| "tables"
	| `charts-${Game}`
	| `songs-${Game}`;

/**
 * Class that encapsulates the behaviour of a seeds repo.
 */
export class DatabaseSeedsRepo {
	private readonly baseDir: string;
	private readonly logger;
	private readonly shouldDestroy: "YES_IM_SURE_PLEASE_LET_THIS_DIRECTORY_BE_RM_RFD" | false;

	/**
	 * Create a seeds repository.
	 *
	 * @param baseDir - A path to the `collections` folder in seeds.
	 * @param shouldDestroy - Whether this repository should be destroyed when .Destroy()
	 * is called or not. This defaults to false, and will result in nothing happening
	 * on cleanup. This behaviour is useful for things like local seeds work.
	 */
	constructor(
		baseDir: string,
		shouldDestroy: "YES_IM_SURE_PLEASE_LET_THIS_DIRECTORY_BE_RM_RFD" | false = false
	) {
		this.baseDir = baseDir;
		this.logger = CreateLogCtx(`DatabaseSeeds:${baseDir}`);
		this.shouldDestroy = shouldDestroy;
	}

	/**
	 * Pull any seeds changes in this repository.
	 */
	pull() {
		if (Environment.nodeEnv === "dev") {
			// prevent an awful interaction where a user edits stuff on their disk
			// and tries to run pnpm load-seeds
			// but it fails because pull can't rebase with changes.
			this.logger.warn(`Not pulling any updates to seeds as we're in local dev.`);
			return;
		}

		this.logger.info(`Pulling updates.`);
		return asyncExec(`git pull`);
	}

	/**
	 * Switch this repository to a new branch. This operation may
	 * fail if there are uncommitted changes.
	 */
	switchBranch(newBranch: string) {
		this.logger.info(`Switching to '${newBranch}'...`);
		return asyncExec(`git switch '${newBranch}'`, this.baseDir);
	}

	private CollectionNameToPath(collectionName: SeedsCollections) {
		return path.join(this.baseDir, `${collectionName}.json`);
	}

	/**
	 * Reads the data from a collection and returns the parsed JSON.
	 *
	 * @returns The data in the requested collection.
	 */
	async ReadCollection<D>(collectionName: SeedsCollections): Promise<Array<D>> {
		const data = await fs.readFile(this.CollectionNameToPath(collectionName), {
			encoding: "utf-8",
		});

		const parsedData = JSON.parse(data) as Array<D>;

		return parsedData;
	}

	/**
	 * Writes a new array to the provided collectionName.
	 *
	 * @param collectionName - The collection to write to.
	 * @param content - A new array of objects to write.
	 */
	async WriteCollection(collectionName: SeedsCollections, content: Array<unknown>) {
		await fs.writeFile(this.CollectionNameToPath(collectionName), JSON.stringify(content));

		// Deterministically sort whatever content we just wrote.
		await asyncExec(`node ../scripts/sort-seeds.js`, this.baseDir);
	}

	/**
	 * Get all available collections as bare filenames, without any extension.
	 *
	 * As an example, seeds/collections/songs-iidx.json would be "songs-iidx".
	 */
	async ListCollections() {
		const colls = await fs.readdir(this.baseDir);

		return colls.map((e) => path.parse(e).name) as Array<SeedsCollections>;
	}

	async *IterateCollections() {
		const collectionNames = await this.ListCollections();

		for (const collectionName of collectionNames) {
			// eslint-disable-next-line no-await-in-loop
			yield { collectionName, data: await this.ReadCollection(collectionName) };
		}
	}

	/**
	 * Mutate a collection with a given name.
	 *
	 * @param collectionName - The collection to mutate.
	 * @param mutator - A function that takes the entire collection as an array, then returns a new array.
	 */
	async MutateCollection<D>(
		collectionName: SeedsCollections,
		mutator: (dataset: Array<D>) => Array<D>
	) {
		const dataset = await this.ReadCollection<D>(collectionName);

		const newData = mutator(dataset);

		return this.WriteCollection(collectionName, newData);
	}

	/**
	 * Provide authentication so that CommitChangesBack can do its job.
	 */
	#AuthenticateWithGitServer() {
		if (!ServerConfig.SEEDS_CONFIG) {
			// Shouldn't be possible. Ever, since SEEDS_CONFIG must be defined in order
			// to run PullDBSeeds
			throw new Error(`Cannot commit changes back. SEEDS_CONFIG is not set.`);
		}

		if (ServerConfig.SEEDS_CONFIG.TYPE !== "GIT_REPO") {
			throw new Error(`Cannot commit changes back: this is a local filesystem.`);
		}

		if (!ServerConfig.SEEDS_CONFIG.USER_NAME || !ServerConfig.SEEDS_CONFIG.USER_EMAIL) {
			throw new Error(
				`Cannot commit changes back if SEEDS_CONFIG.USER_NAME/SEEDS_CONFIG.USER_EMAIL aren't defined.`
			);
		}

		// TS complains that SEEDS_CONFIG.USER_EMAIL might not still be a string by the time the second
		// callback is called, so lets just define it to a local variable.
		const email = ServerConfig.SEEDS_CONFIG.USER_EMAIL;

		const url = new URL(ServerConfig.SEEDS_CONFIG.REPO_URL);

		return asyncExec(
			`git config user.name "${ServerConfig.SEEDS_CONFIG.USER_NAME}"`,
			this.baseDir
		)
			.then(() => asyncExec(`git config user.email "${email}"`, this.baseDir))
			.then(() =>
				asyncExec(
					`git remote set-url origin "https://$GIT_USERNAME:$GIT_PASSWORD@${url.host}${url.pathname}"`,
					this.baseDir
				)
			);
	}

	/**
	 * Checks for any diffs in the seeds repository we cloned. If there are any, commit them back
	 * to the repository.
	 *
	 * @param commitMsg - The commit message.
	 * @returns True when a commit has occured, false when it hasn't. Throws on failure.
	 */
	async CommitChangesBack(commitMsg: string) {
		this.logger.verbose(`Received commit-back request.`);

		try {
			const { stdout: statusOut } = await asyncExec(`git status --porcelain`, this.baseDir);

			if (statusOut === "") {
				this.logger.info(`No changes. Not committing any changes back.`);
				return false;
			}

			// Ok, Testing this is actually a bad idea. Hear me out.
			// It's exceptionally difficult to actually store and look at the test output. (potentially huge)
			// especially when filesystem size is our biggest constraint at the moment.
			//
			// It's better for us to commit straight away, and have the tests on our github CI fail
			// (and subsequently yell at us.)
			//
			// try {
			// 	await asyncExec(`cd "${this.baseDir}/scripts" || exit 2; pnpm install; pnpm test`);
			// } catch ({ err, stdout, stderr }) {
			// 	logger.error(`Testing the changes failed. ${err}. Not committing back!`, { err });
			// 	throw err;
			// }

			this.logger.info(`Changes detected. Authenticating with Github.`);

			await this.#AuthenticateWithGitServer();

			await asyncExec(`git add .`, this.baseDir);
			const { stdout: commitOut } = await asyncExec(
				`git commit -am "automated: ${commitMsg}"`,
				this.baseDir
			);

			await asyncExec(`git push`, this.baseDir);

			this.logger.info(`Commit: ${commitOut}.`);

			return true;
		} catch (err) {
			this.logger.error(`Failed to backport commits?`, { err });
			throw err;
		}
	}

	Destroy() {
		if (this.shouldDestroy === "YES_IM_SURE_PLEASE_LET_THIS_DIRECTORY_BE_RM_RFD") {
			// scary
			return fs.rm(this.baseDir, { recursive: true, force: true });
		}

		this.logger.info(`Refusing to delete seeds as they were instantiated locally.`);
	}
}

/**
 * Pulls the database seeds from github, returns an object that can be used to manipulate them.
 */
export async function PullDatabaseSeeds() {
	if (ServerConfig.SEEDS_CONFIG?.TYPE === "GIT_REPO") {
		const seedsDir = await fs.mkdtemp(path.join(os.tmpdir(), "tachi-seeds-"));

		logger.info(`Cloning data to ${seedsDir}.`);

		await fs.rm(seedsDir, { recursive: true, force: true });

		try {
			const branch = ServerConfig.SEEDS_CONFIG.BRANCH ?? "main";

			// stderr in git clone is normal output.
			// stdout is for errors.
			// there were expletives below this comment, but I have removed them.
			const { stdout: cloneStdout } = await asyncExec(
				`git clone --sparse --depth=1 "${ServerConfig.SEEDS_CONFIG.REPO_URL}" -b "${branch}" "${seedsDir}"`
			);

			if (cloneStdout) {
				throw new Error(cloneStdout);
			}

			const { stdout: checkoutStdout } = await asyncExec(
				`git sparse-checkout add seeds`,
				seedsDir
			);

			// ^ now that we're in a monorepo, we only want the seeds.
			// this shaves quite a bit of time off of the clone.

			if (checkoutStdout) {
				throw new Error(checkoutStdout);
			}

			return new DatabaseSeedsRepo(
				`${seedsDir}/seeds/collections`,
				"YES_IM_SURE_PLEASE_LET_THIS_DIRECTORY_BE_RM_RFD"
			);
		} catch ({ err, stderr }) {
			logger.error(`Error cloning seeds. ${stderr}.`);
			throw err;
		}
	} else if (ServerConfig.SEEDS_CONFIG?.TYPE === "LOCAL_FILES") {
		const local = new DatabaseSeedsRepo(ServerConfig.SEEDS_CONFIG.PATH);

		await local.pull();

		return local;
	} else {
		throw new Error(`SEEDS_CONFIG was not defined. You cannot pull a seeds repo.`);
	}
}

export async function BacksyncCollection(
	collectionName: SeedsCollections,
	collection: ICollection,
	commitMessage: string
) {
	const repo = await PullDatabaseSeeds();

	let charts = await collection.find({});

	await repo.WriteCollection(collectionName, charts);

	// @ts-expect-error Force node to free the memory.
	charts = null;

	await repo.CommitChangesBack(`${commitMessage} ${new Date().toISOString()}`);

	await repo.Destroy();
}
