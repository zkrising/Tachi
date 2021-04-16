import { CloseMongoConnection } from "../db/db";
import { CloseRedisConnection } from "../redis/redis-store";
import { CloseServerConnection } from "./mock-api";

export function CloseAllConnections() {
    CloseMongoConnection();
    CloseServerConnection();
    CloseRedisConnection();
}
