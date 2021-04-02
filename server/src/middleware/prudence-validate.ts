import Prudence, { MiddlewareErrorHandler } from "prudence";

const API_ERR_HANDLER: MiddlewareErrorHandler = (req, res, next, errorMessage) =>
    res.status(400).json({
        success: false,
        description: errorMessage,
    });

const prValidate = Prudence.CurryMiddleware(API_ERR_HANDLER);

export default prValidate;
