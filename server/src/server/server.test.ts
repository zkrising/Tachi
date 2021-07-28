import t from "tap";
import { CloseAllConnections } from "test-utils/close-connections";
import mockApi from "test-utils/mock-api";

t.test("GET /", (t) => {
	t.test("Should return our index.html", async (t) => {
		const res = await mockApi.get("/");

		t.equal(res.text, "<div>Hello World.</div>");

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
