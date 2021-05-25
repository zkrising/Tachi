import Prudence, { MiddlewareErrorHandler } from "prudence";
import CreateLogCtx from "../../logger/logger";

const logger = CreateLogCtx(__filename);

const printf = (message: string, stringVal: string | null, keychain: string | null) =>
    `${message}${stringVal ? ` (Received ${stringVal})` : ""} [K:${keychain}]`;

const API_ERR_HANDLER: MiddlewareErrorHandler = (req, res, next, error) => {
    let stringVal = error.userVal;
    if (error.keychain && error.keychain.includes("password") && error.userVal) {
        stringVal = "****";
    }

    if (typeof stringVal === "object" && stringVal !== null && !stringVal.toString) {
        // this is probably null-prototype
        stringVal = null;
    } else if (stringVal === undefined) {
        stringVal = "nothing";
    } else {
        stringVal = String(stringVal);
    }

    logger.info(`Prudence rejection: ${error.message}, ${stringVal} [K:${error.keychain}]`, {
        userVal: error.userVal,
    });

    return res.status(400).json({
        success: false,
        description: printf(error.message, stringVal as string | null, error.keychain),
    });
};

const prValidate = Prudence.CurryMiddleware(API_ERR_HANDLER);

export default prValidate;
