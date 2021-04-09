import { PrivateUserDocument, PublicUserDocument } from "kamaitachi-common";
import db from "../db";

const PRIVATE_USER_RETURNS = {
    password: 0,
    email: 0,
    // legacy protection - this field does not exist on user documents anymore, but it did, and it *did* hold personal information.
    integrations: 0,
};

/**
 * Gets a user based on their username case-insensitively.
 * @param username The username of the user.
 * @returns PublicUserDocument
 */
export function GetUserCaseInsensitive(username: string) {
    return db.users.findOne(
        {
            usernameLowercase: username.toLowerCase(),
        },
        {
            projection: PRIVATE_USER_RETURNS,
        }
    );
}

/**
 * Returns GetUserCaseInsensitive, but without the private field omission.
 * @see GetUserCaseInsensitive
 * @param username The username of the user.
 * @returns PrivateUserDocument
 */
export function PRIVATEINFO_GetUserCaseInsensitive(username: string) {
    return db.users.findOne({
        usernameLowercase: username.toLowerCase(),
    });
}

/**
 * Returns a formatted string indicating the user. This is used for logging.
 * @param userdoc The user document to format.
 */
export function FormatUserDoc(userdoc: PublicUserDocument) {
    return `${userdoc.username} (~${userdoc.id})`;
}

/**
 * Gets a user based on either their username case-insensitively, or a direct lookup of their ID.
 * This is used in URLs to resolve the passed user.
 * @param usernameOrID
 */
export function ResolveUser(usernameOrID: string) {
    // user ID passed
    if (usernameOrID.match(/^[0-9]$/)) {
        let intID = parseInt(usernameOrID, 10);

        return db.users.findOne(
            {
                id: intID,
            },
            {
                projection: PRIVATE_USER_RETURNS,
            }
        );
    }

    return db.users.findOne(
        {
            usernameLowercase: usernameOrID,
        },
        {
            projection: PRIVATE_USER_RETURNS,
        }
    );
}
