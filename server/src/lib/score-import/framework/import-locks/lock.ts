import db from "../../../../external/mongo/db";
import { integer } from "tachi-common";

/**
 * Gets a users "import lock" if one exists. If one does not exist, it is set.
 * @param userID - The user this import lock is for.
 * @returns If no lock exists for this user (and one was created), undefined is returned
 * If a lock exists for the user, the lock is returned.
 */
export function GetOrSetUserLock(userID: integer) {
    return db["import-locks"].findOneAndUpdate(
        {
            userID,
        },
        {
            userID,
        },
        {
            upsert: true,
            returnDocument: "before",
        }
    );
}

/**
 * Removes a users import lock.
 */
export function RemoveUserLock(userID: integer) {
    return db["import-locks"].remove({
        userID,
    });
}
