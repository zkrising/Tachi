import { CloseMongoConnection } from "../db/db";
import { CloseRedisConnection } from "../redis/redis-store";
import { CloseServerConnection } from "./mock-api";

export async function CloseAllConnections() {
    await CloseMongoConnection();
    await CloseServerConnection();
    await CloseRedisConnection();
}
