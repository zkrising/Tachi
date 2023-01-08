import db from "external/mongo/db";
import { GetGPTConfig } from "tachi-common";
import crypto from "crypto";
import type { DryScore } from "../common/types";
import type { integer, GPTString, ProvidedMetrics } from "tachi-common";

/**
 * Performs sha256 hashing on the input data.
 * @param scoreIDString - The string to sha256 hash.
 * @returns A sha256 checksum in lowercase hex.
 */
function HashScoreIDString(scoreIDString: string) {
	return crypto.createHash("sha256").update(scoreIDString).digest("hex");
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

	for (const m of Object.keys(gptConfig.providedMetrics)) {
		const metric = m as keyof ProvidedMetrics[GPTString];

		elements.push(dryScore.scoreData[metric]);
	}

	const hash = HashScoreIDString(elements.join("\0"));

	return `T${hash}`;
}

export function GetWithScoreID(scoreID: string) {
	return db.scores.findOne({
		scoreID,
	});
}
