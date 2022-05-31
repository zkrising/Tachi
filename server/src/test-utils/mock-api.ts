import server from "../server/server";
import CreateLogCtx from "lib/logger/logger";
import supertest from "supertest";

const logger = CreateLogCtx(__filename);

logger.verbose("Creating Mock Server Connection...");
const connection = server.listen();

logger.verbose("Connecting to Supertest...");
const mockApi = supertest(connection);

export function CloseServerConnection() {
	return new Promise<void>((resolve, reject) => {
		connection.close((err) => {
			if (err) {
				reject(err);
				return;
			}

			resolve();
		});
	});
}

export default mockApi;
