import Prudence, { MiddlewareErrorHandler } from "prudence";

const printf = (message: string, userVal: unknown) =>
    `${message} (Received ${userVal === undefined ? "nothing" : String(userVal)})`;

const API_ERR_HANDLER: MiddlewareErrorHandler = (req, res, next, error) => {
    if (error.keychain && error.keychain.includes("password") && error.userVal) {
        error.userVal = "****";
    }

    res.status(400).json({
        success: false,
        description: printf(error.message, error.userVal),
    });
};

const prValidate = Prudence.CurryMiddleware(API_ERR_HANDLER);

export default prValidate;
