import { CloseMongoConnection } from "external/mongo/db";
import { CloseRedisPubSub } from "external/redis/redis-IPC";
import { CloseRedisConnection } from "external/redis/redis";
import { CloseServerConnection } from "./mock-api";
import { CloseScoreImportQueue } from "lib/score-import/worker/queue";
import { WriteSnapshotData } from "./single-process-snapshot";

export async function CleanUpAfterTests() {
	if (process.env.TAP_SNAPSHOT) {
		WriteSnapshotData();
	}

	await CloseMongoConnection();
	await CloseServerConnection();
	await CloseRedisConnection();
	await CloseRedisPubSub();
	await CloseScoreImportQueue();
}
