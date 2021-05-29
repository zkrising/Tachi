import t from "tap";
import { CloseRedisPubSub, RedisPub, RedisSub } from "./redis-IPC";

t.test("Basic PUB/SUB testing", (t) => {
    t.setTimeout(2000);
    RedisSub("class-update", (d) => {
        t.equal(d.userID, 1);
        t.pass();
        t.end();
    });

    RedisPub("class-update", { userID: 1 } as any);
});

t.teardown(CloseRedisPubSub);
