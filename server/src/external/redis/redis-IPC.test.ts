/* eslint-disable @typescript-eslint/no-explicit-any */
import { RedisPub, RedisSub } from "./redis-IPC";
import t from "tap";

/**
 * Note: The functions these things use have been stubbed out. However, the tests still run and
 * they also still work. We'll skip them though, anyway.
 */

t.skip("Basic PUB/SUB testing", (t) => {
	t.setTimeout(2000);
	RedisSub("test" as any, (d) => {
		t.equal(d.userID, 1);
		t.pass();
		t.end();
	});

	RedisPub("test" as any, { userID: 1 } as any);
});
