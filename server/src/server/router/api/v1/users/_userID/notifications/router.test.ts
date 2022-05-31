import db from "external/mongo/db";
import t from "tap";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import { mkFakeNotification, mkFakeUser } from "test-utils/misc";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import type { NotificationDocument } from "tachi-common";

t.test("GET /api/v1/users/:userID/notifications", async (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(() =>
		Promise.all([
			db.notifications.insert([
				mkFakeNotification({ notifID: "read", read: true, sentAt: 2 }),
				mkFakeNotification({ notifID: "unread", read: false, sentAt: 3 }),
				mkFakeNotification({ notifID: "not_ours", sentTo: 2, sentAt: 4 }),
			]),
			db.users.insert(mkFakeUser(2)),
		])
	);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should return all of this user's notifications, read or unread.", async (t) => {
		const res = await mockApi.get("/api/v1/users/1/notifications").set("Cookie", cookie);

		t.equal(res.statusCode, 200, "Should return 200");

		t.strictSame(
			res.body.body.map((e: NotificationDocument) => e.notifID),
			["unread", "read"],
			"Should return the exact notifications we expected (in most-recent order), and no more."
		);

		t.end();
	});

	t.test("Should return 401 if not authenticated.", async (t) => {
		const res = await mockApi.get("/api/v1/users/1/notifications");

		t.equal(res.statusCode, 401);

		t.end();
	});

	t.test("Should return 403 if authed as someone else.", async (t) => {
		const res = await mockApi.get("/api/v1/users/2/notifications").set("Cookie", cookie);

		t.equal(res.statusCode, 403);

		t.end();
	});

	t.test("Should return 403 if authed as right user without self-key", async (t) => {
		const res = await mockApi
			.get("/api/v1/users/1/notifications")
			.set("Authorization", "Bearer fake_api_token");

		t.equal(res.statusCode, 403);

		t.end();
	});

	t.end();
});

t.test("POST /api/v1/users/:userID/notifications/delete-all", async (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(() =>
		Promise.all([
			db.notifications.insert([
				mkFakeNotification({ notifID: "read", read: true, sentAt: 2 }),
				mkFakeNotification({ notifID: "unread", read: false, sentAt: 3 }),
				mkFakeNotification({ notifID: "unread_2", read: false, sentAt: 4 }),
				mkFakeNotification({ notifID: "not_ours", sentTo: 2, sentAt: 5 }),
			]),
			db.users.insert(mkFakeUser(2)),
		])
	);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should mark all of a user's notifications as read.", async (t) => {
		const res = await mockApi
			.post("/api/v1/users/1/notifications/mark-all-read")
			.set("Cookie", cookie);

		t.equal(res.statusCode, 200, "Should return 200.");

		t.strictSame(res.body.body, {}, "Should have no response body.");

		const dbRes = await db.notifications.findOne({
			sentTo: 1,
			read: false,
		});

		t.equal(dbRes, null, "Should not find any unread messages in the users inbox.");

		t.end();
	});

	t.test("Should return 401 if not authenticated.", async (t) => {
		const res = await mockApi.post("/api/v1/users/1/notifications/mark-all-read");

		t.equal(res.statusCode, 401);

		t.end();
	});

	t.test("Should return 403 if authed as someone else.", async (t) => {
		const res = await mockApi
			.post("/api/v1/users/2/notifications/mark-all-read")
			.set("Cookie", cookie);

		t.equal(res.statusCode, 403);

		t.end();
	});

	t.test("Should return 403 if authed as right user without self-key", async (t) => {
		const res = await mockApi
			.post("/api/v1/users/1/notifications/mark-all-read")
			.set("Authorization", "Bearer fake_api_token");

		t.equal(res.statusCode, 403);

		t.end();
	});

	t.end();
});

t.test("POST /api/v1/users/:userID/notifications/delete-all", async (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(() =>
		Promise.all([
			db.notifications.insert([
				mkFakeNotification({ notifID: "read", read: true, sentAt: 2 }),
				mkFakeNotification({ notifID: "unread", read: false, sentAt: 3 }),
				mkFakeNotification({ notifID: "unread_2", read: false, sentAt: 4 }),
				mkFakeNotification({ notifID: "not_ours", sentTo: 2, sentAt: 5 }),
			]),
			db.users.insert(mkFakeUser(2)),
		])
	);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should empty a user's notification inbox.", async (t) => {
		const res = await mockApi
			.post("/api/v1/users/1/notifications/delete-all")
			.set("Cookie", cookie);

		t.equal(res.statusCode, 200, "Should return 200.");

		t.strictSame(res.body.body, {}, "Should have no response body.");

		const dbRes = await db.notifications.findOne({
			sentTo: 1,
		});

		t.equal(dbRes, null, "Should not find any messages in the users inbox.");

		t.end();
	});

	t.test("Should return 401 if not authenticated.", async (t) => {
		const res = await mockApi.post("/api/v1/users/1/notifications/delete-all");

		t.equal(res.statusCode, 401);

		t.end();
	});

	t.test("Should return 403 if authed as someone else.", async (t) => {
		const res = await mockApi
			.post("/api/v1/users/2/notifications/delete-all")
			.set("Cookie", cookie);

		t.equal(res.statusCode, 403);

		t.end();
	});

	t.test("Should return 403 if authed as right user without self-key", async (t) => {
		const res = await mockApi
			.post("/api/v1/users/1/notifications/delete-all")
			.set("Authorization", "Bearer fake_api_token");

		t.equal(res.statusCode, 403);

		t.end();
	});

	t.end();
});
