import bcrypt from "bcrypt";
import { InviteCodeDocument, PrivateUserDocument, PublicUserDocument } from "tachi-common";
import { InsertResult } from "monk";
import db from "external/mongo/db";
import { GetNextCounterValue } from "utils/db";
import CreateLogCtx from "lib/logger/logger";
import { FormatUserDoc } from "utils/user";
import nodeFetch from "utils/fetch";
import { CAPTCHA_SECRET_KEY } from "lib/setup/config";
import { Random20Hex } from "utils/misc";

const logger = CreateLogCtx(__filename);

const BCRYPT_SALT_ROUNDS = 12;

export const ValidatePassword = (self: unknown) =>
	(typeof self === "string" && self.length >= 8) || "Passwords must be 8 characters or more.";

/**
 * Compares a plaintext string of a users password to a hash.
 * @param plaintext The provided user input.
 * @param password The hash to compare against.
 */
export function PasswordCompare(plaintext: string, password: string) {
	return bcrypt.compare(plaintext, password);
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
	const code = Random20Hex();

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
		socialMedia: {},
		customBanner: false,
		customPfp: false,
		joinDate: Date.now(),
		lastSeen: Date.now(), // lol
		authLevel: "user",
		badges: [],
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
		return false;
	}

	return true;
}
