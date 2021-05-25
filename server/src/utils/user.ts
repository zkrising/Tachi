import { integer, PublicUserDocument } from "kamaitachi-common";
import { FindOneResult } from "monk";
import db from "../external/mongo/db";
import CreateLogCtx from "./logger";

const logger = CreateLogCtx(__filename);

const OMIT_PRIVATE_USER_RETURNS = {
    password: 0,
    email: 0,
    // legacy protection - this field does not exist on user documents anymore, but it did, and it *did* hold personal information.
    integrations: 0,
};

/**
 * Gets a user based on their username case-insensitively.
 * @param username The username of the user.
 * @returns PublicUserDocument | null
 */
export function GetUserCaseInsensitive(
    username: string
): Promise<FindOneResult<PublicUserDocument>> {
    return db.users.findOne(
        {
            usernameLowercase: username.toLowerCase(),
        },
        {
            projection: OMIT_PRIVATE_USER_RETURNS,
        }
    ) as Promise<FindOneResult<PublicUserDocument>>;
}

/**
 * Returns GetUserCaseInsensitive, but without the private field omission.
 * @see GetUserCaseInsensitive
 * @param username The username of the user.
 * @returns PrivateUserDocument | null
 */
export function PRIVATEINFO_GetUserCaseInsensitive(username: string) {
    return db.users.findOne({
        usernameLowercase: username.toLowerCase(),
    });
}

/**
 * Gets a user from their userID.
 * @param userID The userID to retrieve the user document of.
 * @returns PublicUserDocument | null
 */
export function GetUserWithID(userID: integer): Promise<FindOneResult<PublicUserDocument>> {
    return db.users.findOne(
        {
            id: userID,
        },
        {
            projection: OMIT_PRIVATE_USER_RETURNS,
        }
    ) as Promise<FindOneResult<PublicUserDocument>>;
}

/**
 * Retrieve a user document that is expected to exist.
 * If the user document is not found, a severe error is logged, and this
 * function throws.
 *
 * @param userID The userID to retrieve the user document of.
 * @returns PublicUserDocument
 */
export async function GetUserWithIDGuaranteed(userID: integer): Promise<PublicUserDocument> {
    const userDoc = await GetUserWithID(userID);

    if (!userDoc) {
        logger.severe(
            `User ${userID} does not have an associated user document, but one was expected.`
        );
        throw new Error(
            `User ${userID} does not have an associated user document, but one was expected.`
        );
    }

    return userDoc;
}

/**
 * GetUserWithID, but return personal information, too.
 * @see GetUserWithID
 * @param userID
 * @returns PrivateUserDocument | null
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
    if (usernameOrID.match(/^[0-9]$/u)) {
        const intID = Number(usernameOrID);

        return GetUserWithID(intID);
    }

    return GetUserCaseInsensitive(usernameOrID);
}

/**
 * Returns a formatted string indicating the user. This is used for logging.
 * @param userdoc The user document to format.
 */
export function FormatUserDoc(userdoc: PublicUserDocument) {
    return `${userdoc.username} (#${userdoc.id})`;
}
