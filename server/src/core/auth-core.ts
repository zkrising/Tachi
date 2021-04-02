import crypto from "crypto";
import bcrypt from "bcrypt";
import { BetaKeyDocument, PrivateUserDocument, PublicAPIKeyDocument } from "kamaitachi-common";
import db from "../db";
import { GetNextCounterValue } from "./db-core";
import { InsertResult } from "monk";
import createLogCtx from "../logger";

const logger = createLogCtx("auth-core.ts");

const BCRYPT_SALT_ROUNDS = 12;

export function CreateAPIKey(): string {
    return crypto.randomBytes(20).toString("hex");
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

    return db.get<PublicAPIKeyDocument>("public-api-keys").insert(publicApiKeyDoc);
}

export function ReinstateBetakey(bkDoc: BetaKeyDocument) {
    logger.info(`Reinstated beta key ${bkDoc.betakey}`);
    return db.get<BetaKeyDocument>("betakeys").update(
        {
            _id: bkDoc._id,
        },
        {
            $set: {
                consumed: false,
            },
        }
    );
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
        socialmedia: {},
        settings: {
            invisible: false,
            nsfwsplashes: false,
            trustEamIIDXTimestamps: false,
            useSimpleLadderColours: true,
        },
        custombanner: false,
        custompfp: false,
        lastSeen: Date.now(), // lol
        permissions: {
            admin: false, // lol (2)
        },
    };

    return db.get<PrivateUserDocument>("users").insert(userDoc);
}
