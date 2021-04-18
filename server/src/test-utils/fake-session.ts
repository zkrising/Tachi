import mockApi from "./mock-api";
import assert from "assert";
import db from "../db/db";
import ResetDBState from "./reset-db-state";
import CreateLogCtx from "../logger";

const logger = CreateLogCtx("fake-session.ts");

export async function CreateFakeAuthCookie() {
    await ResetDBState();
    // possible security issue, ask hazel
    let res = await mockApi.post("/internal-api/auth/login").send({
        username: "test_zkldi",
        password: "password",
        captcha: "asdf",
    });

    if (res.status !== 200) {
        logger.crit("Failed to login. Cannot generate auth cookie.");
        throw res.body;
    }

    return res.headers["set-cookie"] as string[];
}

export async function DestroyFakeAuthToken(cookie: string) {
    // stub
}
