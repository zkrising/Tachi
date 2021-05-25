import supertest from "supertest";
import CreateLogCtx from "../logger/logger";

const logger = CreateLogCtx(__filename);

import server from "../server/server";

logger.verbose("Creating Mock Server Connection...");
const connection = server.listen(8079);

logger.verbose("Connecting to Supertest...");
const mockApi = supertest(connection);

export function CloseServerConnection() {
    connection.close();
}

export default mockApi;
