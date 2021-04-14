/**
 * Helper utility to exit deeply nested routes
 */

/**
 * Throw this if the ScoreImport is now completely screwed,
 * and needs to exit (completely!).
 */
export default class ScoreImportFatalError extends Error {
    statusCode: number;

    constructor(statusCode: number, description: string) {
        super(description);

        this.statusCode = statusCode;
    }
}
