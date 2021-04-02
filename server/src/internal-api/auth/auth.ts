import { Router } from "express";
import { BetaKeyDocument } from "kamaitachi-common";
import Prudence from "prudence";
import { AddNewUser, AddNewUserAPIKey, ReinstateBetakey } from "../../core/auth-core";
import { ValidateCaptcha } from "../../core/captcha-core";
import db from "../../db";
import createLogCtx from "../../logger";
import prValidate from "../../middleware/prudence-validate";

const logger = createLogCtx("auth.ts");

const router = Router({ mergeParams: true });

// ??? eslint cant parse this regex.
// eslint-disable-next-line no-useless-escape
const LAZY_EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Registers a new user.
 * @name /internal-api/auth/register
 */
router.post(
    "/register",
    prValidate(
        {
            username: Prudence.regex(/^[a-zA-Z_-][a-zA-Z0-9_-]{2,20}$/),
            password: (self) => typeof self === "string" && self.length > 8,
            email: Prudence.regex(LAZY_EMAIL_REGEX),
            betakey: "string",
            captcha: "string",
        },
        {
            username:
                "Usernames must be between 3 and 20 characters long, and can only contain alphanumeric characters!",
            email: "Invalid email.",
            password: "Passwords must be more than 8 characters.",
            betakey: "Invalid beta key.",
            captcha: "Please fill out the captcha.",
        }
    ),
    async (req, res) => {
        logger.verbose(`Recieved register request with username ${req.body.username} (${req.ip})`);

        if (process.env.NODE_ENV === "production") {
            logger.verbose("Validating captcha...");
            let validCaptcha = await ValidateCaptcha(req);

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

        let existingUser = await db.get("users").findOne({
            usernameLowercase: req.body.username.toLowerCase(),
        });

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
                `Bailed on user creation ${req.body.username} with betakey ${req.body.betakey}`
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
    }
);

export default router;
