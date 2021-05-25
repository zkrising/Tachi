import ResetDBState from "./reset-db-state";
import CreateLogCtx from "../lib/logger/logger";
import supertest from "supertest";

const logger = CreateLogCtx(__filename);

export async function CreateFakeAuthCookie(mockApi: supertest.SuperTest<supertest.Test>) {
    await ResetDBState();

    // possible security issue, ask hazel
    const res = await mockApi.post("/api/v1/auth/login").send({
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
