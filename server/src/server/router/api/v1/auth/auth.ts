import bcrypt from "bcryptjs";
import {
	integer,
	PrivateUserInfoDocument,
	PublicUserDocument,
	UserAuthLevels,
	UserSettings,
} from "tachi-common";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { FormatUserDoc } from "utils/user";
import nodeFetch from "utils/fetch";
import { Random20Hex } from "utils/misc";
import { ServerConfig } from "lib/setup/config";
import { CreateURLWithParams } from "utils/url";

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

export function ReinstateInvite(code: string) {
	logger.info(`Reinstated Invite ${code}`);
	return db.invites.update(
		{
			code,
		},
		{
			$set: {
				consumed: false,
				consumedAt: null,
				consumedBy: null,
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
		createdAt: Date.now(),
		consumedAt: null,
		consumedBy: null,
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

const DEFAULT_USER_SETTINGS: UserSettings["preferences"] = {
	developerMode: false,
	invisible: false,
};

export async function AddNewUser(
	username: string,
	password: string,
	email: string,
	userID: integer
) {
	const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

	logger.verbose(`Hashed password for ${username}.`);

	const userDoc: PublicUserDocument = {
		id: userID,
		username,
		usernameLowercase: username.toLowerCase(),
		about: "I'm a fairly nondescript person.",
		clan: null,
		socialMedia: {},
		status: null,
		customBanner: false,
		customPfp: false,
		joinDate: Date.now(),
		lastSeen: Date.now(),
		authLevel: UserAuthLevels.USER,
		badges: [],
	};

	const res = await db.users.insert(userDoc);

	const settingsRes = await InsertDefaultUserSettings(userID);

	await InsertPrivateUserInfo(userID, hashedPassword, email);

	return { newUser: res, newSettings: settingsRes };
}

export function InsertPrivateUserInfo(userID: integer, hashedPassword: string, email: string) {
	const privateInfo: PrivateUserInfoDocument = {
		userID,
		email,
		password: hashedPassword,
	};

	return db["user-private-information"].insert(privateInfo);
}

export function InsertDefaultUserSettings(userID: integer) {
	logger.verbose(`Inserting default settings for ${userID}.`);
	const userSettings: UserSettings = {
		userID,
		preferences: DEFAULT_USER_SETTINGS,
	};

	return db["user-settings"].insert(userSettings);
}

export async function ValidateCaptcha(
	recaptcha: string,
	remoteAddr: string | undefined,
	fetch = nodeFetch
) {
	const url = CreateURLWithParams(`https://www.google.com/recaptcha/api/siteverify`, {
		secret: ServerConfig.CAPTCHA_SECRET_KEY,
		response: recaptcha,
		remoteip: remoteAddr ?? "",
	});

	const r = await fetch(url.href);

	if (r.status !== 200) {
		logger.verbose(`Failed GCaptcha response ${r.status}, ${r.body}`);
		return false;
	}

	return true;
}

export function MountAuthCookie(
	req: Express.Request,
	user: PublicUserDocument,
	settings: UserSettings
) {
	req.session.tachi = {
		user,
		settings,
	};

	req.session.cookie.maxAge = 3.154e10;
	req.session.cookie.secure = process.env.NODE_ENV === "production";
}
