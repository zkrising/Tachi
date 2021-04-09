/**
 * Helper utility to exit deeply nested routes
 */

import { KTReponse } from "../../../types";

/**
 * Throw this if the ScoreImport is now completely screwed,
 * and needs to exit (completely!).
 */
export default class ScoreImportFatalError extends Error {
    statusCode: number;
    data: KTReponse;

    constructor(statusCode: number, data: KTReponse) {
        super(data.description);

        this.statusCode = statusCode;
        this.data = data;
    }
}
