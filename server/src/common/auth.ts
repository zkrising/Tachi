import crypto from "crypto";
import bcrypt from "bcrypt";
import {
    InviteCodeDocument,
    PrivateUserDocument,
    PublicAPIKeyDocument,
    PublicUserDocument,
} from "kamaitachi-common";
import db from "../db/db";
import { GetNextCounterValue } from "./db";
import { InsertResult } from "monk";
import CreateLogCtx from "../logger";
import { FormatUserDoc } from "./user";

const logger = CreateLogCtx("auth.ts");

const BCRYPT_SALT_ROUNDS = 12;

export const ValidatePassword = (self: unknown) =>
    (typeof self === "string" && self.length >= 8) || "Passwords must be 8 characters or more.";

export function CreateAPIKey(): string {
    return crypto.randomBytes(20).toString("hex");
}

/**
 * Despite these functions doing ultimately the same thing, they're separate incase they ever need to,
 * you know, not do that.
 * @returns A string
 */
export function CreateInviteCode(): string {
    return crypto.randomBytes(20).toString("hex");
}

/**
 * Compares a plaintext string of a users password to a hash.
 * @param plaintext The provided user input.
 * @param password The hash to compare against.
 */
export function PasswordCompare(plaintext: string, password: string) {
    return bcrypt.compare(plaintext, password);
}

export function AddNewUserAPIKey(
    privateUserDoc: PrivateUserDocument
): Promise<InsertResult<PublicAPIKeyDocument>> {
    const apikey = CreateAPIKey();

    const publicApiKeyDoc: PublicAPIKeyDocument = {
        apiKey: apikey,
        assignedTo: privateUserDoc.id,
        expireTime: 3176708633264,
        permissions: {
            selfkey: true, // not sure what this was for but i'll keep it deliberately
            admin: false,
        },
    };

    return db["public-api-keys"].insert(publicApiKeyDoc);
}

export function ReinstateInvite(inviteDoc: InviteCodeDocument) {
    logger.info(`Reinstated Invite ${inviteDoc.code}`);
    return db.invites.update(
        {
            _id: inviteDoc._id,
        },
        {
            $set: {
                consumed: false,
            },
        }
    );
}

export async function AddNewInvite(user: PublicUserDocument) {
    let code = CreateInviteCode();

    let result = await db.invites.insert({
        code,
        consumed: false,
        createdBy: user.id,
        createdOn: Date.now(),
    });

    logger.info(`User ${FormatUserDoc(user)} created an invite.`);

    if (!result) {
        logger.error(
            `Fatal error in creating ${FormatUserDoc(
                user
            )}'s invite code. Database refused key ${code}.`
        );
        throw new Error(
            `Fatal error in creating ${FormatUserDoc(
                user
            )}'s invite code. Database refused key ${code}.`
        );
    }

    return result;
}

export async function AddNewUser(
    username: string,
    password: string,
    email: string
): Promise<InsertResult<PrivateUserDocument>> {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    logger.verbose(`Hashed password for ${username}.`);

    const userID = await GetNextCounterValue("users");

    const userDoc: PrivateUserDocument = {
        id: userID,
        username: username,
        usernameLowercase: username.toLowerCase(),
        password: hashedPassword,
        about: "I'm a fairly nondescript person.",
        email: email,
        clan: null,
        friends: [],
        socialMedia: {},
        settings: {
            invisible: false,
            nsfwSplashes: false,
        },
        customBanner: false,
        customPfp: false,
        lastSeen: Date.now(), // lol
        permissions: {
            admin: false, // lol (2)
        },
    };

    return db.users.insert(userDoc);
}
