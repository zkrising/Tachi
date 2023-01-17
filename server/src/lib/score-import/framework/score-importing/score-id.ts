import db from "external/mongo/db";
import { GetGPTConfig } from "tachi-common";
import crypto from "crypto";
import type { DryScore } from "../common/types";
import type { integer, GPTString, ProvidedMetrics, OptionalMetrics } from "tachi-common";

/**
 * Performs sha256 hashing on the input data.
 * @param scoreIDString - The string to sha256 hash.
 * @returns A sha256 checksum in lowercase hex.
 */
function HashScoreIDString(scoreIDString: string) {
	return crypto.createHash("sha256").update(scoreIDString).digest("hex");
}

function SortKeysAlphabetically(a: string, b: string) {
	return a.localeCompare(b, "en-GB");
}

/**
 * Creates an identifier for this score.
 * This is used to deduplicate repeated scores.
 * @returns @see HashScoreIDString - prefixed with R.
 */
export function CreateScoreID(
	gptString: GPTString,
	userID: integer,
	dryScore: DryScore,
	chartID: string
) {
	const elements = [userID, chartID];

	const gptConfig = GetGPTConfig(gptString);

	// @warn
	// we need to sort these metric keys deterministically instead
	// of relying on any sort of object-insertion order
	// as that would throw the checksum out of sync.
	for (const m of Object.keys(gptConfig.providedMetrics).sort(SortKeysAlphabetically)) {
		const metric = m as keyof ProvidedMetrics[GPTString];

		elements.push(dryScore.scoreData[metric]);
	}

	// Also include optional metrics in the checksum if they should be
	// part of the scoreID.
	for (const [m, conf] of Object.entries(gptConfig.optionalMetrics).sort((a, b) =>
		SortKeysAlphabetically(a[0], b[0])
	)) {
		const metric = m as keyof OptionalMetrics[GPTString];

		if (conf.partOfScoreID) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			elements.push(dryScore.scoreData.optional[metric] ?? null);
		}
	}

	const hash = HashScoreIDString(elements.join("\0"));

	return `T${hash}`;
}

export function GetWithScoreID(scoreID: string) {
	return db.scores.findOne({
		scoreID,
	});
}
