import { Router } from "express";
import Prudence from "prudence";
import {
	AddNewUser,
	PasswordCompare,
	ReinstateInvite,
	ValidatePassword,
	ValidateCaptcha,
	MountAuthCookie,
	InsertDefaultUserSettings,
} from "./auth";
import {
	FormatUserDoc,
	GetSettingsForUser,
	GetUserCaseInsensitive,
	GetUserWithEmail,
	GetUserWithID,
	PRIVATEINFO_GetUserCaseInsensitive,
} from "utils/user";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import prValidate from "server/middleware/prudence-validate";
import { DecrementCounterValue, GetNextCounterValue } from "utils/db";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

const LAZY_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;

/**
 * Logs in a user.
 * @name POST /api/v1/auth/login
 */
router.post(
	"/login",
	prValidate(
		{
			username: Prudence.regex(/^[a-zA-Z_-][a-zA-Z0-9_-]{2,20}$/u),
			password: ValidatePassword,
			captcha: "string",
		},
		{
			username:
				"Invalid username. Usernames cannot start with a number, and must be between 2 and 20 characters.",
			captcha: "Please fill out the captcha.",
		}
	),
	async (req, res) => {
		if (req.session.tachi?.user.id) {
			logger.info(`Dual log-in attempted from ${req.session.tachi.user.id}`);
			return res.status(409).json({
				success: false,
				description: `You are already logged in as someone.`,
			});
		}

		logger.verbose(`Recieved login request with username ${req.body.username} (${req.ip})`);

		/* istanbul ignore next */
		if (process.env.NODE_ENV === "production") {
			logger.verbose("Validating captcha...");
			const validCaptcha = await ValidateCaptcha(
				req.body.recaptcha,
				req.socket.remoteAddress
			);

			if (!validCaptcha) {
				logger.verbose("Captcha failed.");
				return res.status(400).json({
					success: false,
					description: `Captcha failed.`,
				});
			}

			logger.verbose("Captcha validated!");
		} else {
			logger.verbose("Skipped captcha check because not in production.");
		}

		const requestedUser = await PRIVATEINFO_GetUserCaseInsensitive(req.body.username);

		if (!requestedUser) {
			logger.verbose(`Invalid username for login ${req.body.username}.`);
			return res.status(404).json({
				success: false,
				description: `This user does not exist.`,
			});
		}

		const passwordMatch = await PasswordCompare(req.body.password, requestedUser.password);

		if (!passwordMatch) {
			logger.verbose("Invalid password provided.");
			return res.status(401).json({
				success: false,
				description: `Invalid password.`,
			});
		}

		const user = await GetUserWithID(requestedUser.id);

		if (!user) {
			logger.severe(`User logged in as someone who does not exist?`, { requestedUser });
			return res.status(500).json({
				success: false,
				description: `An internal server error has occured.`,
			});
		}

		let settings = await GetSettingsForUser(requestedUser.id);

		if (!settings) {
			logger.warn(`User ${FormatUserDoc(user)} has no settings. Inserting default settings.`);
			settings = await InsertDefaultUserSettings(user.id);
		}

		MountAuthCookie(req, user, settings);

		logger.verbose(`${FormatUserDoc(requestedUser)} Logged in.`);

		return res.status(200).json({
			success: true,
			description: `Successfully logged in as ${FormatUserDoc(requestedUser)}`,
			body: {
				userID: requestedUser.id,
			},
		});
	}
);

/**
 * Registers a new user.
 * @name POST /api/v1/auth/register
 */
router.post(
	"/register",
	prValidate(
		{
			username: Prudence.regex(/^[a-zA-Z_-][a-zA-Z0-9_-]{2,20}$/u),
			password: ValidatePassword,
			email: Prudence.regex(LAZY_EMAIL_REGEX),
			inviteCode: "string",
			captcha: "string",
		},
		{
			username:
				"Usernames must be between 3 and 20 characters long, can only contain alphanumeric characters and cannot start with a number.",
			email: "Invalid email.",
			inviteCode: "Invalid invite code.",
			captcha: "Please fill out the captcha.",
		}
	),
	async (req, res) => {
		logger.verbose(`Recieved register request with username ${req.body.username} (${req.ip})`);

		/* istanbul ignore next */
		if (process.env.NODE_ENV === "production") {
			logger.verbose("Validating captcha...");
			const validCaptcha = await ValidateCaptcha(
				req.body.recaptcha,
				req.socket.remoteAddress
			);

			if (!validCaptcha) {
				logger.verbose("Captcha failed.");
				return res.status(400).json({
					success: false,
					description: `Captcha failed.`,
				});
			}

			logger.verbose("Captcha validated.");
		} else {
			logger.warn("Skipped captcha check because not in production.");
		}

		const existingUser = await GetUserCaseInsensitive(req.body.username);

		if (existingUser) {
			logger.verbose(`Invalid username ${req.body.username}, already in use.`);
			return res.status(409).json({
				success: false,
				description: "This username is already in use.",
			});
		}

		const existingEmail = await GetUserWithEmail(req.body.email);

		if (existingEmail) {
			logger.info(`User attempted to use email ${req.body.email}, but was already in use.`);
			return res.status(409).json({
				success: false,
				description: `This email is already in use.`,
			});
		}

		try {
			const userID = await GetNextCounterValue("users");
			const inviteCodeDoc = await db.invites.findOneAndUpdate(
				{
					code: req.body.inviteCode,
					consumed: false,
				},
				{
					$set: {
						consumed: true,
						consumedAt: Date.now(),
						consumedBy: userID,
					},
				}
			);

			if (!inviteCodeDoc) {
				logger.info(`Invalid invite code given: ${req.body.inviteCode}.`);
				return res.status(401).json({
					success: false,
					description: `This invite code is not valid.`,
				});
			}

			logger.info(`Consumed invite ${inviteCodeDoc.code}.`);

			// if we get to this point, We're good to create the user.

			const { newUser, newSettings } = await AddNewUser(
				req.body.username,
				req.body.password,
				req.body.email,
				userID
			);

			if (!newUser) {
				throw new Error("AddNewUser failed to create a user.");
			}

			// re-fetch the user like this so we guaranteeably omit the private fields.
			const user = await GetUserWithID(newUser.id);

			MountAuthCookie(req, user!, newSettings);

			return res.status(200).json({
				success: true,
				description: `Successfully created account ${req.body.username}!`,
				body: user,
			});
		} catch (err) {
			logger.error(
				`Bailed on user creation ${req.body.username} with invite code ${req.body.inviteCode}.`,
				{ err }
			);

			await ReinstateInvite(req.body.inviteCode);
			await DecrementCounterValue("users");

			return res.status(500).json({
				success: false,
				description: "An internal server error has occured.",
			});
		}
	}
);

/**
 * Logs out the requesting user.
 * @name POST /api/v1/auth/logout
 */
router.post("/logout", (req, res) => {
	if (!req.session?.tachi?.user.id) {
		return res.status(409).json({
			success: false,
			description: `You are not logged in.`,
		});
	}

	req.session.destroy(() => 0);

	return res.status(200).json({
		success: true,
		description: `Logged Out.`,
		body: {},
	});
});

export default router;
