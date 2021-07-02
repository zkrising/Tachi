import t from "tap";
import { CDNStoreOrOverwrite } from "../../../lib/cdn/cdn";
import { CloseAllConnections } from "../../../test-utils/close-connections";
import mockApi from "../../../test-utils/mock-api";

t.test("GET /cdn", (t) => {
	t.test("Should return this content at the CDN.", async (t) => {
		await CDNStoreOrOverwrite("/foo", "hello world");

		const res = await mockApi.get("/cdn/foo");

		t.equal(res.body.toString(), "hello world");

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
