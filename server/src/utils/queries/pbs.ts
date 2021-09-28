import db from "external/mongo/db";
import { PBScoreDocument } from "tachi-common";

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
	)) as PBScoreDocument<"usc:Single">[];

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
	)) as PBScoreDocument<"usc:Single">[];

	return adjAbove;
}
