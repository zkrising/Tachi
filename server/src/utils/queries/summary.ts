import db from "external/mongo/db";
import { integer } from "tachi-common";
import { GetTimeXHoursAgo } from "utils/misc";

// Various utils related to the player summary endpoint.
const REASONABLE_HOURS_AGO = 16;

export function GetRecentPlaycount(userID: integer) {
	const time = GetTimeXHoursAgo(REASONABLE_HOURS_AGO);

	return db.scores.count({ userID, timeAchieved: { $gte: time } });
}

export function GetRecentSessions(userID: integer) {
	const time = GetTimeXHoursAgo(REASONABLE_HOURS_AGO);

	return db.sessions.find({
		userID,
		timeEnded: { $gte: time },
	});
}

export async function GetRecentlyViewedFoldersAnyGPT(userID: integer) {
	const time = GetTimeXHoursAgo(REASONABLE_HOURS_AGO);

	const views = await db["recent-folder-views"].find(
		{
			userID,
			lastViewed: { $gte: time },
		},
		{
			sort: {
				lastViewed: -1,
			},
			limit: 4,
		}
	);

	const folders = await db.folders.find({
		folderID: { $in: views.map((e) => e.folderID) },
	});

	// TODO: Sort recently viewed folders based on how recently viewed
	// they were.

	return folders;
}
