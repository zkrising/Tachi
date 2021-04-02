import { Request } from "express";
import fetch from "node-fetch";
import createLogCtx from "../logger";
import { CAPTCHA_SECRET_KEY } from "../secrets";

const logger = createLogCtx("captcha-core.ts");

// shrug

export async function ValidateCaptcha(req: Request) {
    let r = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${CAPTCHA_SECRET_KEY}&response=${req.body.recaptcha}&remoteip=${req.socket.remoteAddress}`
    );

    if (r.status !== 200) {
        logger.verbose(`GCaptcha response ${r.status}, ${r.body}`);
    }

    return r.status === 200;
}
