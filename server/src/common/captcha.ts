import nodeFetch from "../fetch";
import CreateLogCtx from "../logger";
import { CAPTCHA_SECRET_KEY } from "../secrets";

const logger = CreateLogCtx("captcha.ts");

// shrug

export async function ValidateCaptcha(
    recaptcha: string,
    remoteAddr: string | undefined,
    fetch = nodeFetch
) {
    let r = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${CAPTCHA_SECRET_KEY}&response=${recaptcha}&remoteip=${remoteAddr}`
    );

    if (r.status !== 200) {
        logger.verbose(`GCaptcha response ${r.status}, ${r.body}`);
    }

    return r.status === 200;
}
