import t from "tap";
import db from "../../../../../external/mongo/db";
import { CloseAllConnections } from "../../../../../test-utils/close-connections";
import mockApi from "../../../../../test-utils/mock-api";
import ResetDBState from "../../../../../test-utils/reset-db-state";

t.test("POST /api/v1/auth/status", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should return 401 if no cookie provided", async (t) => {
        const res = await mockApi.post("/api/v1/auth/status");

        t.equal(res.status, 401);

        t.end();
    });

    t.test("Should return 401 if invalid cookie provided", async (t) => {
        const res = await mockApi.post("/api/v1/auth/status").set("Cookie", "invalid");

        t.equal(res.status, 401);

        t.end();
    });

    t.test("Should return 200 if valid cookie provided", async (t) => {
        const authRes = await mockApi.post("/api/v1/auth/login").send({
            username: "test_zkldi",
            password: "password",
            captcha: "foo",
        });

        const res = await mockApi
            .post("/api/v1/auth/status")
            .set("Cookie", authRes.headers["set-cookie"]);

        t.equal(res.status, 200);

        t.end();
    });

    t.end();
});

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

        const stat = await mockApi.post("/api/v1/auth/status").set("Cookie", cookie);

        t.equal(stat.status, 200);

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

t.teardown(CloseAllConnections);
