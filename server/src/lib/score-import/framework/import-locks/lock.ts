import db from "external/mongo/db";
import { integer } from "tachi-common";

/**
 * If a user has no ongoing import, enable the import lock and return true.
 * If a user has an ongoing import, return false.
 *
 * @param userID - The user this import lock is for.
 * @returns True if the lock was set successfully, false if the user already
 * has a lock.
 */
export async function CheckAndSetOngoingImportLock(userID: integer) {
	const lockExists = await db["import-locks"].findOne({
		userID,
	});

	if (!lockExists) {
		await db["import-locks"].insert({
			userID,
			locked: false,
		});
	}

	const lockWasSet = await db["import-locks"].findOneAndUpdate(
		{
			userID,
			locked: false,
		},
		{
			$set: { locked: true },
		}
	);

	return !lockWasSet;
}

/**
 * Disable a users import lock.
 */
export function UnsetOngoingImportLock(userID: integer) {
	return db["import-locks"].findOneAndUpdate(
		{
			userID,
			locked: true,
		},
		{
			$set: { locked: false },
		}
	);
}
