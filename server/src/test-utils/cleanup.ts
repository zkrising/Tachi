import { CloseServerConnection } from "./mock-api";
import { WriteSnapshotData } from "./single-process-snapshot";
import { CloseMongoConnection } from "external/mongo/db";
import { CloseRedisConnection } from "external/redis/redis";
import { CloseRedisPubSub } from "external/redis/redis-IPC";
import { CloseScoreImportQueue } from "lib/score-import/worker/queue";

export async function CleanUpAfterTests() {
	if (process.env.TAP_SNAPSHOT !== "" && process.env.TAP_SNAPSHOT !== undefined) {
		WriteSnapshotData();
	}

	await CloseMongoConnection();
	await CloseServerConnection();
	await CloseRedisConnection();
	await CloseRedisPubSub();
	await CloseScoreImportQueue();
}
