import supertest from "supertest";
import CreateLogCtx, { rootLogger } from "../logger";

import server from "../server";

rootLogger.info("Creating Mock Server Connection...");
const connection = server.listen(8079);

rootLogger.info("Connecting to Supertest...");
const mockApi = supertest(connection);

export function CloseServerConnection() {
    connection.close();
}

export default mockApi;
