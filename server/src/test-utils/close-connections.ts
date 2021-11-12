import { CloseMongoConnection } from "external/mongo/db";
import { CloseRedisPubSub } from "external/redis/redis-IPC";
import { CloseRedisConnection } from "external/redis/redis";
import { CloseServerConnection } from "./mock-api";
import { CloseScoreImportQueue } from "lib/score-import/worker/queue";

export async function CloseAllConnections() {
	await CloseMongoConnection();
	await CloseServerConnection();
	await CloseRedisConnection();
	await CloseRedisPubSub();
	await CloseScoreImportQueue();
}
