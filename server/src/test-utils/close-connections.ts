import { CloseMongoConnection } from "../external/mongo/db";
import { CloseRedisConnection } from "../external/redis/redis-store";
import { CloseServerConnection } from "./mock-api";

export async function CloseAllConnections() {
    await CloseMongoConnection();
    await CloseServerConnection();
    await CloseRedisConnection();
}
