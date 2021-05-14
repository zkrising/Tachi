import supertest from "supertest";
import CreateLogCtx from "../logger";

const logger = CreateLogCtx("mock-api.ts");

import server from "../server";

logger.verbose("Creating Mock Server Connection...");
const connection = server.listen(8079);

logger.verbose("Connecting to Supertest...");
const mockApi = supertest(connection);

export function CloseServerConnection() {
    connection.close();
}

export default mockApi;
