import { request, Router } from "express";
import { BetaKeyDocument, PublicAPIKeyDocument } from "kamaitachi-common";
import Prudence from "prudence";
import {
    AddNewUser,
    AddNewUserAPIKey,
    CreateAPIKey,
    PasswordCompare,
    ReinstateBetakey,
    ValidatePassword,
} from "../../core/auth-core";
import { ValidateCaptcha } from "../../core/captcha-core";
import {
    FormatUserDoc,
    GetUserCaseInsensitive,
    PRIVATEINFO_GetUserCaseInsensitive,
} from "../../core/user-core";
import db from "../../db";
import createLogCtx from "../../logger";
import prValidate from "../../middleware/prudence-validate";

const logger = createLogCtx("auth.ts");

const router = Router({ mergeParams: true });

// ??? eslint cant parse this regex.
// eslint-disable-next-line no-useless-escape
const LAZY_EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const BASE_DOMAIN = process.env.NODE_ENV === "production" ? ".kamaitachi.xyz" : "127.0.0.1";
const SHOULD_COOKIES_SECURE = process.env.NODE_ENV === "production";

/**
 * Logs in a user.
 * @name /internal-api/auth/login
 */
router.post(
    "/login",
    prValidate(
        {
            username: Prudence.regex(/^[a-zA-Z_-][a-zA-Z0-9_-]{2,20}$/),
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

        if (process.env.NODE_ENV === "production") {
            logger.verbose("Validating captcha...");
            let validCaptcha = await ValidateCaptcha(req.body.recaptcha, req.socket.remoteAddress);

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

        let requestedUser = await PRIVATEINFO_GetUserCaseInsensitive(req.body.username);

        if (!requestedUser) {
            logger.verbose(`Invalid username for login ${req.body.username}.`);
            return res.status(400).json({
                success: false,
                description: `This user does not exist.`,
            });
        }

        let passwordMatch = await PasswordCompare(req.body.password, requestedUser.password);

        if (!passwordMatch) {
            logger.verbose("Invalid password provided.");
            return res.status(400).json({
                success: false,
                description: `Invalid password.`,
            });
        }

        // username and password match up, we're good to check onwards

        let apiKeyDoc = await db.get<PublicAPIKeyDocument>("public-api-keys").findOne({
            assignedTo: requestedUser.id,
            "permissions.selfkey": true,
        });

        if (!apiKeyDoc) {
            logger.warn(
                `User ${FormatUserDoc(requestedUser)} did not have an apikey. Creating a new one.`
            );

            let newApiKey = await AddNewUserAPIKey(requestedUser);

            if (!newApiKey) {
                logger.error(
                    `Bailed on user login ${FormatUserDoc(
                        requestedUser
                    )}. Could not create new apikey.`
                );

                throw new Error("FATAL in /register - apikey was unable to be created?");
            }

            apiKeyDoc = newApiKey;
        }

        req.session.ktchi = {
            userID: requestedUser.id,
            apiKey: apiKeyDoc.apiKey,
        };

        req.session.cookie.maxAge = 3.154e10; // 1 year

        // API wants a cookie called "apikey" in order to make authorised requests. This might change.
        res.cookie("apikey", apiKeyDoc.apiKey, {
            maxAge: 3.154e10,
            domain: BASE_DOMAIN,
            secure: SHOULD_COOKIES_SECURE,
        });

        return res.status(200).json({
            success: true,
            description: `Successfully logged in as ${FormatUserDoc(requestedUser)}`,
            body: {
                userID: requestedUser.id,
                apiKey: apiKeyDoc.apiKey,
            },
        });
    }
);

/**
 * Registers a new user.
 * @name /internal-api/auth/register
 */
router.post(
    "/register",
    prValidate(
        {
            username: Prudence.regex(/^[a-zA-Z_-][a-zA-Z0-9_-]{2,20}$/),
            password: ValidatePassword,
            email: Prudence.regex(LAZY_EMAIL_REGEX),
            betakey: "string",
            captcha: "string",
        },
        {
            username:
                "Usernames must be between 3 and 20 characters long, and can only contain alphanumeric characters!",
            email: "Invalid email.",
            betakey: "Invalid beta key.",
            captcha: "Please fill out the captcha.",
        }
    ),
    async (req, res) => {
        logger.verbose(`Recieved register request with username ${req.body.username} (${req.ip})`);

        if (process.env.NODE_ENV === "production") {
            logger.verbose("Validating captcha...");
            let validCaptcha = await ValidateCaptcha(req.body.recaptcha, req.socket.remoteAddress);

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

        let existingUser = await GetUserCaseInsensitive(req.body.username);

        if (existingUser) {
            logger.verbose(`Invalid username ${req.body.username}, already in use.`);
            return res.status(409).json({
                success: false,
                description: "This username is already in use.",
            });
        }

        let bkeyDoc = await db.get<BetaKeyDocument>("betakeys").findOneAndUpdate(
            {
                betakey: req.body.betakey,
                consumed: false,
            },
            {
                $set: {
                    consumed: true,
                },
            }
        );

        if (!bkeyDoc) {
            logger.info(`Invalid betakey given: ${req.body.betakey}.`);
            return res.status(401).json({
                success: false,
                description: `This beta key is not valid.`,
            });
        }

        logger.info(`Consumed betakey ${bkeyDoc.betakey}.`);

        // if we get to this point, We're good to create the user.

        let newUser = await AddNewUser(req.body.username, req.body.password, req.body.email);

        if (!newUser) {
            logger.error(
                `Bailed on user creation ${req.body.username} with betakey ${req.body.betakey}.`
            );

            await ReinstateBetakey(bkeyDoc);

            throw new Error("FATAL in /register - User was created, but refused?");
        }

        let apiKeyDoc = await AddNewUserAPIKey(newUser);

        if (!apiKeyDoc) {
            logger.error(
                `Bailed on user creation ${req.body.username} with betakey ${req.body.betakey}`
            );

            await ReinstateBetakey(bkeyDoc);
            throw new Error("FATAL in /register - apikey was created, but refused?");
        }

        return res.status(200).json({
            success: true,
            description: `Successfully created account ${req.body.username}!`,
            body: {
                id: newUser.id,
                username: newUser.username,
            },
        });
    }
);

/**
 * Logs out the requesting user.
 * @name /internal-api/auth/logout
 */
router.post("/logout", (req, res) => {
    if (!req.session.ktchi?.userID) {
        return res.status(400).json({
            success: false,
            description: `Unable to log out - you are not logged in as anyone!`,
        });
    }

    req.session.destroy(() => 0);
    res.clearCookie("apikey");

    return res.status(200).json({
        success: true,
        description: `Logged Out.`,
        body: {},
    });
});

export default router;
