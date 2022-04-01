import CreateLogCtx from "lib/logger/logger";
import supertest from "supertest";
import server from "../server/server";

const logger = CreateLogCtx(__filename);

logger.verbose("Creating Mock Server Connection...");
const connection = server.listen();

logger.verbose("Connecting to Supertest...");
const mockApi = supertest(connection);

export function CloseServerConnection() {
	connection.close();
}

export default mockApi;
