import t from "tap";
import db from "external/mongo/db";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { PrivateUserDocument, PublicUserDocument } from "tachi-common";

t.test("GET /api/v1/users", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should search users if search param is set.", async (t) => {
		const res = await mockApi.get("/api/v1/users?search=zkldi");

		t.equal(res.body.body.length, 1);
		t.equal(res.body.body[0].username, "test_zkldi");

		const res2 = await mockApi.get("/api/v1/users?search=nothing");

		t.equal(res2.body.body.length, 0);

		const res3 = await mockApi.get("/api/v1/users?search=ZklDI");

		t.equal(res3.body.body.length, 1);
		t.equal(res3.body.body[0].username, "test_zkldi");

		t.end();
	});

	t.test("Should sanitise input for regex stuff.", async (t) => {
		const res = await mockApi.get("/api/v1/users?search=.*");

		t.equal(res.body.body.length, 0);

		t.end();
	});

	t.test("Should restrict returns to only online users if online is set.", async (t) => {
		const res = await mockApi.get("/api/v1/users?online=true");

		t.equal(res.body.body.length, 0);

		await db.users.insert({
			usernameLowercase: "online_dude",
			lastSeen: Date.now(),
			id: 2,
		} as PrivateUserDocument);

		const res2 = await mockApi.get("/api/v1/users?online=true");

		t.equal(res2.body.body.length, 1);
		t.equal(res2.body.body[0].usernameLowercase, "online_dude");

		t.end();
	});

	t.test("Should return users sorted by lastSeen if no arguments are passed.", async (t) => {
		await db.users.insert({
			usernameLowercase: "online_dude",
			lastSeen: Date.now(),
			id: 2,
		} as PrivateUserDocument);

		const res = await mockApi.get("/api/v1/users");

		t.equal(res.body.body.length, 2);
		t.strictSame(
			res.body.body.map((e: PublicUserDocument) => e.usernameLowercase),
			["online_dude", "test_zkldi"]
		);

		t.end();
	});

	t.end();
});
