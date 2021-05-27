import { Router } from "express";
import Prudence from "prudence";
import {
    AddNewUser,
    PasswordCompare,
    ReinstateInvite,
    ValidatePassword,
    ValidateCaptcha,
} from "./auth";
import {
    FormatUserDoc,
    GetUserCaseInsensitive,
    PRIVATEINFO_GetUserCaseInsensitive,
} from "../../../../../utils/user";

import db from "../../../../../external/mongo/db";
import CreateLogCtx from "../../../../../lib/logger/logger";
import prValidate from "../../../../middleware/prudence-validate";
import { RequireLoggedIn } from "../../../../middleware/require-logged-in";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

const LAZY_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;

/**
 * Utility for checking whether you are logged in or not.
 * @name POST /api/v1/auth/status
 */
router.post("/status", RequireLoggedIn, (req, res) =>
    res.status(200).json({
        success: true,
        description: "Logged In.",
        body: {
            userID: req.session.ktchi!.userID,
        },
    })
);

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
            username: "Invalid username.",
            captcha: "Please fill out the captcha.",
        }
    ),
    async (req, res) => {
        if (req.session.ktchi?.userID) {
            logger.info(`Dual log-in attempted from ${req.session.ktchi.userID}`);
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

        req.session.ktchi = {
            userID: requestedUser.id,
        };

        req.session.cookie.maxAge = 3.154e10; // 1 year

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
                "Usernames must be between 3 and 20 characters long, and can only contain alphanumeric characters!",
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

            logger.verbose("Captcha validated!");
        } else {
            logger.info("Skipped captcha check because not in production.");
        }

        const existingUser = await GetUserCaseInsensitive(req.body.username);

        if (existingUser) {
            logger.verbose(`Invalid username ${req.body.username}, already in use.`);
            return res.status(409).json({
                success: false,
                description: "This username is already in use.",
            });
        }

        const inviteCodeDoc = await db.invites.findOneAndUpdate(
            {
                code: req.body.inviteCode,
                consumed: false,
            },
            {
                $set: {
                    consumed: true,
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

        try {
            const newUser = await AddNewUser(req.body.username, req.body.password, req.body.email);

            if (!newUser) {
                throw new Error("AddNewUser failed to create a user.");
            }

            return res.status(200).json({
                success: true,
                description: `Successfully created account ${req.body.username}!`,
                body: {
                    id: newUser.id,
                    username: newUser.username,
                },
            });
        } catch (err) {
            logger.error(
                `Bailed on user creation ${req.body.username} with invite code ${req.body.inviteCode}.`,
                { err }
            );

            await ReinstateInvite(inviteCodeDoc);

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
router.post("/logout", RequireLoggedIn, (req, res) => {
    req.session.destroy(() => 0);

    return res.status(200).json({
        success: true,
        description: `Logged Out.`,
        body: {},
    });
});

export default router;
