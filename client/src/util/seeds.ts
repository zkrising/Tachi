import { AllDatabaseSeeds, DatabaseSeedNames } from "tachi-common";
import { APIFetchV1 } from "./api";

/**
 * Given a repo and a reference return the status of database-seeds/collections
 * as of that commit.
 */
export async function LoadSeeds(repo: string, ref: string): Promise<Partial<AllDatabaseSeeds>> {
	if (repo === "local") {
		const params = new URLSearchParams();

		if (ref) {
			params.set("revision", ref);
		}

		const res = await APIFetchV1<Partial<AllDatabaseSeeds>>(
			`/seeds/collections?${params.toString()}`
		);

		if (!res.success) {
			throw new Error(
				`Failed to fetch collections @ ${ref}. ${res.statusCode}: ${res.description}`
			);
		}

		return res.body;
	} else if (repo.startsWith("GitHub:")) {
		const data: Partial<AllDatabaseSeeds> = {};

		await Promise.all(
			DatabaseSeedNames.map(async (file) => {
				const res = await fetch(
					`https://raw.githubusercontent.com/${repo.substring(
						"GitHub:".length
					)}/${ref}/database-seeds/collections/${file}`
				);

				if (res.status === 404) {
					data[file] = [];
				} else if (res.status === 200) {
					data[file] = await res.json();
				} else {
					throw new Error(
						`Failed to fetch collections @ ${repo} ${ref}. ${
							res.status
						} ${await res.text()}`
					);
				}
			})
		);

		return data;
	}

	throw new Error(`Unknown repository type '${repo}'.`);
}
