import crypto from "crypto";
import bcrypt from "bcrypt";
import {
    InviteCodeDocument,
    PrivateUserDocument,
    PublicAPIKeyDocument,
    PublicUserDocument,
} from "kamaitachi-common";
import { InsertResult } from "monk";
import { CAPTCHA_SECRET_KEY } from "../../../../../example-secrets";
import db from "../../../../../external/mongo/db";
import { GetNextCounterValue } from "../../../../../utils/db";
import CreateLogCtx from "../../../../../lib/logger/logger";
import { FormatUserDoc } from "../../../../../utils/user";
import nodeFetch from "../../../../../utils/fetch";

const logger = CreateLogCtx(__filename);

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
    const code = CreateInviteCode();

    const result = await db.invites.insert({
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

export async function ValidateCaptcha(
    recaptcha: string,
    remoteAddr: string | undefined,
    fetch = nodeFetch
) {
    const r = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${CAPTCHA_SECRET_KEY}&response=${recaptcha}&remoteip=${remoteAddr}`
    );

    if (r.status !== 200) {
        logger.verbose(`Failed GCaptcha response ${r.status}, ${r.body}`);
    }

    return r.status === 200;
}
