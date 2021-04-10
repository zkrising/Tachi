import { integer, PublicUserDocument } from "kamaitachi-common";
import db from "../db";

const OMIT_PRIVATE_USER_RETURNS = {
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
export function GetUserCaseInsensitive(username: string): Promise<PublicUserDocument> {
    return db.users.findOne(
        {
            usernameLowercase: username.toLowerCase(),
        },
        {
            projection: OMIT_PRIVATE_USER_RETURNS,
        }
    ) as Promise<PublicUserDocument>;
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
 * Gets a user from their userID.
 * @param userID The userID to retrieve the user document of.
 * @returns PublicUserDocument
 */
export function GetUserWithID(userID: integer): Promise<PublicUserDocument> {
    return db.users.findOne(
        {
            id: userID,
        },
        {
            projection: OMIT_PRIVATE_USER_RETURNS,
        }
    ) as Promise<PublicUserDocument>;
}

/**
 * GetUserWithID, but return personal information, too.
 * @see GetUserWithID
 * @param userID
 * @returns PrivateUserDocument
 */
export function PRIVATEINFO_GetUserWithID(userID: integer) {
    return db.users.findOne({
        id: userID,
    });
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
                projection: OMIT_PRIVATE_USER_RETURNS,
            }
        );
    }

    return db.users.findOne(
        {
            usernameLowercase: usernameOrID,
        },
        {
            projection: OMIT_PRIVATE_USER_RETURNS,
        }
    );
}
