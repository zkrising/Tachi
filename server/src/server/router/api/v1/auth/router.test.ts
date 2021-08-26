import t from "tap";
import db from "external/mongo/db";
import { CloseAllConnections } from "test-utils/close-connections";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";

t.test("POST /api/v1/auth/login", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should log a user in with right credentials", async (t) => {
		const res = await mockApi.post("/api/v1/auth/login").send({
			username: "test_zkldi",
			password: "password",
			captcha: "foo",
		});

		t.equal(res.status, 200);
		t.equal(res.body.success, true);
		t.strictSame(res.body.body, {
			userID: 1,
		});

		const cookie = res.headers["set-cookie"];

		const stat = await mockApi.get("/api/v1/status").set("Cookie", cookie);

		t.ok(stat.body.body.permissions.length > 0);

		t.end();
	});

	t.test("Should return 409 if user already logged in", async (t) => {
		const res = await mockApi.post("/api/v1/auth/login").send({
			username: "test_zkldi",
			password: "password",
			captcha: "foo",
		});

		const cookie = res.headers["set-cookie"];

		const res2 = await mockApi
			.post("/api/v1/auth/login")
			.send({
				username: "test_zkldi",
				password: "password",
				captcha: "foo",
			})
			.set("Cookie", cookie);

		t.equal(res2.status, 409);

		t.end();
	});

	t.test("Should return 401 if password invalid", async (t) => {
		const res = await mockApi.post("/api/v1/auth/login").send({
			username: "test_zkldi",
			password: "invalid_password",
			captcha: "foo",
		});

		t.equal(res.status, 401);

		t.end();
	});

	t.test("Should return 404 if user invalid", async (t) => {
		const res = await mockApi.post("/api/v1/auth/login").send({
			username: "invalid_user",
			password: "password",
			captcha: "foo",
		});

		t.equal(res.status, 404);

		t.end();
	});

	t.test("Should return 400 if no password", async (t) => {
		const res = await mockApi.post("/api/v1/auth/login").send({
			username: "invalid_user",
			captcha: "foo",
		});

		t.equal(res.status, 400);

		t.end();
	});

	t.test("Should return 400 if no username", async (t) => {
		const res = await mockApi.post("/api/v1/auth/login").send({
			password: "password",
			captcha: "foo",
		});

		t.equal(res.status, 400);

		t.end();
	});

	t.test("Should return 400 if no captcha", async (t) => {
		const res = await mockApi.post("/api/v1/auth/login").send({
			password: "password",
			username: "test_zkldi",
		});

		t.equal(res.status, 400);

		t.end();
	});

	t.end();
});

t.test("POST /api/v1/auth/register", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(() =>
		db.invites.insert({
			code: "code",
			createdBy: 1,
			createdAt: 0,
			consumed: false,
			consumedAt: null,
			consumedBy: null,
		})
	);

	t.test("Should register a new user.", async (t) => {
		const res = await mockApi.post("/api/v1/auth/register").send({
			username: "foo",
			password: "password",
			email: "foo@bar.com",
			captcha: "1",
			inviteCode: "code",
		});

		t.equal(res.statusCode, 200);
		t.equal(res.body.success, true);
		t.equal(res.body.body.username, "foo");

		const doc = await db.users.findOne({ username: "foo" });

		t.not(doc, null);

		t.end();
	});

	t.test("Should disallow users with matching names.", async (t) => {
		const res = await mockApi.post("/api/v1/auth/register").send({
			username: "test_zkldi",
			password: "password",
			email: "foo@bar.com",
			captcha: "1",
			inviteCode: "code",
		});

		t.equal(res.statusCode, 409);
		t.equal(res.body.success, false);

		t.end();
	});

	t.test("Should disallow users with matching names case insensitively.", async (t) => {
		const res = await mockApi.post("/api/v1/auth/register").send({
			username: "test_zKLdi",
			password: "password",
			email: "foo@bar.com",
			captcha: "1",
			inviteCode: "code",
		});

		t.equal(res.statusCode, 409);
		t.equal(res.body.success, false);

		t.end();
	});

	t.test("Should disallow email if it is already used.", async (t) => {
		const res = await mockApi.post("/api/v1/auth/register").send({
			username: "foo",
			password: "password",
			email: "thepasswordis@password.com", // this is our test docs email, apparently.
			captcha: "1",
			inviteCode: "code",
		});

		t.equal(res.statusCode, 409);
		t.equal(res.body.success, false);

		t.end();
	});

	t.test("Should disallow invalid emails.", async (t) => {
		const res = await mockApi.post("/api/v1/auth/register").send({
			username: "foo",
			password: "password",
			email: "nonsense+email",
			captcha: "1",
			inviteCode: "code",
		});

		t.equal(res.statusCode, 400);
		t.equal(res.body.success, false);

		t.end();
	});

	t.test("Should disallow short passwords.", async (t) => {
		const res = await mockApi.post("/api/v1/auth/register").send({
			username: "foo",
			password: "pass",
			email: "foo@bar.com",
			captcha: "1",
			inviteCode: "code",
		});

		t.equal(res.statusCode, 400);
		t.equal(res.body.success, false);

		t.end();
	});

	t.test("Should disallow invalid usernames.", async (t) => {
		const res = await mockApi.post("/api/v1/auth/register").send({
			username: "3foo",
			password: "password",
			email: "foo@bar.com",
			captcha: "1",
			inviteCode: "code",
		});

		t.equal(res.statusCode, 400);
		t.equal(res.body.success, false);

		const res2 = await mockApi.post("/api/v1/auth/register").send({
			username: "f",
			password: "password",
			email: "foo@bar.com",
			captcha: "1",
			inviteCode: "code",
		});

		t.equal(res2.statusCode, 400);
		t.equal(res2.body.success, false);

		t.end();
	});

	t.test("Should recover from a fatal error without breaking state.", async (t) => {
		await db.counters.update({ counterName: "users" }, { $set: { value: 1 } }); // this will cause a userID collision

		const res = await mockApi.post("/api/v1/auth/register").send({
			username: "foo",
			password: "password",
			email: "foo@bar.com",
			captcha: "1",
			inviteCode: "code",
		});

		t.equal(res.statusCode, 500);

		const counter = await db.counters.findOne({ counterName: "users" });

		// value should not stay incremented
		t.equal(counter?.value, 1);

		const invite = await db.invites.findOne({ code: "code" });

		// invite should not be consumed
		t.equal(invite?.consumed, false);

		t.end();
	});

	t.end();
});
