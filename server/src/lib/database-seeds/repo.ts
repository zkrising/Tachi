import path from "path";
import os from "os";
import CreateLogCtx from "lib/logger/logger";
import { Environment, ServerConfig } from "lib/setup/config";
import { asyncExec } from "utils/misc";
import { Game } from "tachi-common";
import fs from "fs/promises";

const logger = CreateLogCtx(__filename);

export type SeedsCollections =
	| `charts-${Game}`
	| `songs-${Game}`
	| "bms-course-lookup"
	| "folders"
	| "tables";

/**
 * Class that encapsulates the behaviour of a seeds repo.
 */
export class DatabaseSeedsRepo {
	private baseDir: string;
	private logger;

	constructor(baseDir: string) {
		this.baseDir = baseDir;
		this.logger = CreateLogCtx(`DatabaseSeeds:${baseDir}`);
	}

	private CollectionNameToPath(collectionName: SeedsCollections) {
		return path.join(this.baseDir, "collections", `${collectionName}.json`);
	}

	/**
	 * Reads the data from a collection and returns the parsed JSON.
	 *
	 * @returns The data in the requested collection.
	 */
	async ReadCollection<D>(collectionName: SeedsCollections): Promise<D[]> {
		const data = await fs.readFile(this.CollectionNameToPath(collectionName), {
			encoding: "utf-8",
		});

		const parsedData = JSON.parse(data) as D[];

		return parsedData;
	}

	/**
	 * Writes a new array to the provided collectionName.
	 *
	 * @param collectionName - The collection to write to.
	 * @param content - A new array of objects to write.
	 */
	async WriteCollection(collectionName: SeedsCollections, content: unknown[]) {
		await fs.writeFile(this.CollectionNameToPath(collectionName), JSON.stringify(content));

		// Deterministically sort whatever content we just wrote.
		await asyncExec(
			`cd "${this.baseDir}" || exit 1; node scripts/deterministic-collection-sort.js`
		);
	}

	async *IterateCollections() {
		const collectionNames = (await fs.readdir(path.join(this.baseDir, "collections"))).map(
			(e) => path.parse(e).name
		) as SeedsCollections[];

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
	async MutateCollection<D>(collectionName: SeedsCollections, mutator: (dataset: D[]) => D[]) {
		const dataset = await this.ReadCollection<D>(collectionName);

		const newData = mutator(dataset);

		return this.WriteCollection(collectionName, newData);
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
			const { stdout: statusOut } = await asyncExec(
				`cd "${this.baseDir}" || exit 1; git status --porcelain`
			);

			if (statusOut === "") {
				this.logger.info(`No changes. Not committing any changes back.`);
				return false;
			}

			this.logger.info(`Changes. Committing changes back.`);

			const { stdout: commitOut } = await asyncExec(
				`cd "${this.baseDir}" || exit 2;
				git add . || exit 3;
				git commit -am "${commitMsg}" || exit 4;
				git push`
			);

			this.logger.info(`Commit: ${commitOut}.`);

			return true;
		} catch (err) {
			this.logger.error(`Failed to backport commits?`, { err });
			throw err;
		}
	}
}

/**
 * Pulls the database seeds from github, returns an object that can be used to manipulate them.
 */
export async function PullDatabaseSeeds() {
	if (!ServerConfig.SEEDS_URL) {
		throw new Error(`SEEDS_URL was null. You cannot pull a seeds repo.`);
	}

	const seedsDir = await fs.mkdtemp(path.join(os.tmpdir(), "tachi-database-seeds-"));

	logger.info(`Cloning data to ${seedsDir}.`);

	await fs.rm(seedsDir, { recursive: true, force: true });

	try {
		// stderr in git clone is normal output.
		// stdout is for errors.
		// there were expletives below this comment, but I have removed them.
		const { stdout } = await asyncExec(
			`git clone "${ServerConfig.SEEDS_URL}" -b "${
				Environment.nodeEnv === "production" ? "master" : "develop"
			}" --depth=1 '${seedsDir}'`
		);

		// isn't that confusing
		if (stdout) {
			logger.error(stdout);
		}

		return new DatabaseSeedsRepo(seedsDir);
	} catch ({ err, stdout, stderr }) {
		logger.error(`Error cloning database-seeds. ${stderr}.`);
		throw err;
	}
}
