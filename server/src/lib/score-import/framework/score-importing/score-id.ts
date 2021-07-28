import crypto from "crypto";
import db from "external/mongo/db";
import { integer } from "tachi-common";
import { DryScore } from "../common/types";

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
export function CreateScoreID(userID: integer, dryScore: DryScore, chartID: string) {
	const hash = HashScoreIDString(
		`${userID}|${chartID}|${dryScore.scoreData.lamp}|${dryScore.scoreData.grade}|${dryScore.scoreData.score}|${dryScore.scoreData.percent}`
	);

	return `R${hash}`;
}

export function GetWithScoreID(scoreID: string) {
	return db.scores.findOne({
		scoreID,
	});
}
