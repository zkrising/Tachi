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
	HashPassword,
} from "./auth";
import {
	CheckIfEmailInUse,
	FormatUserDoc,
	GetSettingsForUser,
	GetUserCaseInsensitive,
	GetUserPrivateInfo,
	GetUserWithID,
} from "utils/user";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import prValidate from "server/middleware/prudence-validate";
import { DecrementCounterValue, GetNextCounterValue } from "utils/db";
import { SendEmail } from "lib/email/client";
import { EmailFormatResetPassword, EmailFormatVerifyEmail } from "lib/email/formats";
import { Random20Hex } from "utils/misc";
import { ServerConfig } from "lib/setup/config";

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

		const requestedUser = await GetUserCaseInsensitive(req.body.username);

		if (!requestedUser) {
			logger.verbose(`Invalid username for login ${req.body.username}.`);
			return res.status(404).json({
				success: false,
				description: `This user does not exist.`,
			});
		}

		const privateInfo = await GetUserPrivateInfo(requestedUser.id);

		if (!privateInfo) {
			logger.severe(
				`State desync for user ${FormatUserDoc(
					requestedUser
				)}. This user has no password/email information?`,
				{ requestedUser }
			);

			return res.status(500).json({
				success: false,
				description: `An internal server error has occured.`,
			});
		}

		const passwordMatch = await PasswordCompare(req.body.password, privateInfo.password);

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

		const existingEmail = await CheckIfEmailInUse(req.body.email);

		if (existingEmail) {
			logger.info(`User attempted to sign up with email that was already in use.`);
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

			const resetEmailCode = Random20Hex();

			await db["verify-email-codes"].insert({
				code: resetEmailCode,
				userID: userID,
				email: req.body.email,
			});

			await SendEmail(req.body.email, EmailFormatVerifyEmail(user!.username, resetEmailCode));

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
 * Verifies the provided email according to the code provided.
 *
 * @param code - The emailCode set in the /register function.
 *
 * @name POST /api/v1/auth/verify-email
 */
router.post(
	"/verify-email",
	prValidate({
		code: "string",
	}),
	async (req, res) => {
		const code = await db["verify-email-codes"].findOne({
			code: req.body.code,
		});

		if (!code) {
			return res.status(400).json({
				success: false,
				description: `This email code is invalid.`,
			});
		}

		await db["verify-email-codes"].remove({
			code: req.body.code,
		});

		return res.status(200).json({
			success: true,
			description: `Verified email!`,
			body: {},
		});
	}
);

/**
 * Resend a verification email, for when they fall through the
 * cracks.
 *
 * @param email - The email to send a verification email to.
 *
 * @name POST /api/v1/auth/resend-verify-email
 */
router.post("/resend-verify-email", prValidate({ email: "string" }), async (req, res) => {
	// Immediately send a response so the existence of emails
	// cannot be timing attacked out.
	res.status(200).json({
		success: true,
		description: `Sent an email if the email address has not been verified.`,
		body: {},
	});

	const verifyInfo = await db["verify-email-codes"].findOne({ email: req.body.email });

	if (!verifyInfo) {
		logger.warn(
			`Attempted to send reset email to ${req.body.email}, but no verifyInfo was set for them.`
		);
		return;
	}

	const user = await GetUserWithID(verifyInfo.userID);

	if (!user) {
		logger.severe(`Email verifyInfo belongs to user that no longer exists?`, verifyInfo);
		return;
	}

	// Send the email again.
	await SendEmail(req.body.email, EmailFormatVerifyEmail(user!.username, verifyInfo.code));
});

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

/**
 * Creates a password reset code for a user. The user will then
 * be able to trigger POST /reset-password with that code.
 *
 * @param email - The email associated with the account you want to reset.
 *
 * @name POST /api/v1/auth/forgot-password
 */
router.post("/forgot-password", prValidate({ email: "string" }), async (req, res) => {
	if (!ServerConfig.EMAIL_CONFIG) {
		return res.status(501).json({
			success: false,
			description: `This server does not support password resets.`,
		});
	}

	logger.debug(`Recieved password reset request for ${req.body.email}.`);
	// For timing attack and infosec reasons, we can't do anything but **immediately** return here.
	res.status(202).json({
		success: true,
		description: "A code has been sent to your email.",
		body: {},
	});

	const userPrivateInfo = await db["user-private-information"].findOne({ email: req.body.email });

	if (userPrivateInfo) {
		const user = await db.users.findOne({ id: userPrivateInfo.userID });

		if (!user) {
			logger.severe(
				`User ${userPrivateInfo.userID} has private information but no real account.`
			);
			return;
		}

		const code = `M${Random20Hex()}`;

		logger.verbose(`Created password reset code for ${FormatUserDoc(user)}.`);

		await db["password-reset-codes"].insert({
			code,
			userID: user.id,
			createdOn: Date.now(),
		});

		await SendEmail(
			userPrivateInfo.email,
			EmailFormatResetPassword(user.username, code, req.ip)
		);
	} else {
		logger.info(
			`Silently rejected password reset request for ${req.body.email}, as no user has this email.`
		);
	}
});

/**
 * Takes a code generated from /forgot-password, a new password,
 * and performs the reset for the user.
 *
 * @param password - The users new password.
 * @param code - The code to use to reset this password.
 *
 * @name POST /api/v1/auth/reset-password
 */
router.post(
	"/reset-password",
	prValidate({
		code: "string",
		password: ValidatePassword,
	}),
	async (req, res) => {
		const code = await db["password-reset-codes"].findOneAndDelete({
			code: req.body.code,
		});

		if (!code) {
			return res.status(404).json({
				success: false,
				description: `Invalid Reset Code.`,
			});
		}

		const encryptedPassword = await HashPassword(req.body.password);

		await db["user-private-information"].update(
			{
				userID: code.userID,
			},
			{
				$set: {
					password: encryptedPassword,
				},
			}
		);

		logger.info(`User ${code.userID} reset their password.`);

		return res.status(200).json({
			success: true,
			description: `Reset your password.`,
			body: {},
		});
	}
);

export default router;
