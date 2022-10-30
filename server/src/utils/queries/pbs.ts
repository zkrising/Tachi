import db from "external/mongo/db";
import type { IDStrings, integer, PBScoreDocument, ScoreCalculatedDataLookup } from "tachi-common";

export async function GetAdjacentAbove(userPB: PBScoreDocument, size = 5) {
	const adjAbove = (await db["personal-bests"].find(
		{
			chartID: userPB.chartID,
			"rankingData.rank": { $lt: userPB.rankingData.rank },
		},
		{
			limit: size,
			sort: { "rankingData.rank": -1 },
		}
	)) as Array<PBScoreDocument<"usc:Controller" | "usc:Keyboard">>;

	return adjAbove;
}

export async function GetAdjacentBelow(userPB: PBScoreDocument, size = 5) {
	const adjAbove = (await db["personal-bests"].find(
		{
			chartID: userPB.chartID,
			"rankingData.rank": { $gt: userPB.rankingData.rank },
		},
		{
			limit: size,
			sort: { "rankingData.rank": 1 },
		}
	)) as Array<PBScoreDocument<"usc:Controller" | "usc:Keyboard">>;

	return adjAbove;
}

export type PBsWithPersonalRanking = Array<PBScoreDocument & { __personalRanking: integer }>;

/**
 * Given a user, an algorithm, and an array of chartIDs, return the user's PBs
 * on those charts with where they rank in their personal PBs.
 */
export async function GetPBsWithUserRankings(
	userID: integer,
	chartIDs: Array<string>,
	alg: ScoreCalculatedDataLookup[IDStrings]
) {
	// i was going to do this with a fancy aggregate pipeline
	// but it's slower.
	// ah well
	const pbs = (await db["personal-bests"].find({
		userID,
		chartID: { $in: chartIDs },
		isPrimary: true,
	})) as Array<PBScoreDocument & { __personalRanking?: integer }>;

	await Promise.all(
		pbs.map(async (pb) => {
			const personalRanking = await db["personal-bests"].count({
				userID,
				[`calculatedData.${alg}`]: { $gt: pb.calculatedData[alg] },
			});

			// eslint-disable-next-line require-atomic-updates
			pb.__personalRanking = personalRanking + 1;
		})
	);

	// __personalRanking guaranteed to be assigned
	return pbs as PBsWithPersonalRanking;
}
