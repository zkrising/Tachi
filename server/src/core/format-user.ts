import { PublicUserDocument } from "kamaitachi-common";

/**
 * Returns a formatted string indicating the user. This is used for logging.
 * (This is not in user-core.ts to avoid a circular reference issue with logger.ts<->db.ts)
 * @param userdoc The user document to format.
 */
export function FormatUserDoc(userdoc: PublicUserDocument) {
    return `${userdoc.username} (~${userdoc.id})`;
}
