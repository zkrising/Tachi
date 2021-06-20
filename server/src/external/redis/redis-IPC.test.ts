/* eslint-disable @typescript-eslint/no-explicit-any */
import t from "tap";
import { CloseRedisPubSub, RedisPub, RedisSub } from "./redis-IPC";

t.test("Basic PUB/SUB testing", (t) => {
	t.setTimeout(2000);
	RedisSub("test" as any, (d) => {
		t.equal(d.userID, 1);
		t.pass();
		t.end();
	});

	RedisPub("test" as any, { userID: 1 } as any);
});

t.teardown(CloseRedisPubSub);
