import db from "external/mongo/db";

export async function GetBlacklist() {
	return (await db["score-blacklist"].find({}, { projection: { scoreID: 1 } })).map(
		(e) => e.scoreID
	);
}
