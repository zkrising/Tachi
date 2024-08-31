import db from "external/mongo/db";
import { ONE_DAY, ONE_HOUR } from "lib/constants/time";
import CreateLogCtx from "lib/logger/logger";
import type { integer } from "tachi-common";

const logger = CreateLogCtx(__filename);

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
			lockedAt: null,
		});
	} else if (lockExists.locked && lockExists.lockedAt! + ONE_DAY < Date.now()) {
		logger.warn(`Removed import lock for ${userID} as it is ostensibly stuck.`);
		await db["import-locks"].update(
			{
				userID,
			},
			{
				locked: false,
				lockedAt: null,
			}
		);
	}

	const lockWasSet = await db["import-locks"].findOneAndUpdate(
		{
			userID,
			locked: false,
		},
		{
			$set: { locked: true, lockedAt: Date.now() },
		}
	);

	if (!lockWasSet) {
		return true;
	}

	if (lockWasSet.lockedAt !== null) {
		if (Date.now() - lockWasSet.lockedAt > ONE_HOUR) {
			logger.error(
				`User ${userID} has been locked for an hour. Automatically freeing the lock as they're stuck.`
			);
			await UnsetOngoingImportLock(userID);
		}
	}

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
			$set: { locked: false, lockedAt: null },
		}
	);
}
