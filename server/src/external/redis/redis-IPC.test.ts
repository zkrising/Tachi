/* eslint-disable @typescript-eslint/no-explicit-any */
import t from "tap";
import { RedisPub, RedisSub } from "./redis-IPC";

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
