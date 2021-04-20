import ResetDBState from "./reset-db-state";
import CreateLogCtx from "../logger";
import supertest from "supertest";

const logger = CreateLogCtx("fake-session.ts");

export async function CreateFakeAuthCookie(mockApi: supertest.SuperTest<supertest.Test>) {
    logger.info("1");
    await ResetDBState();
    logger.info("2");
    // possible security issue, ask hazel
    let res = await mockApi.post("/internal-api/auth/login").send({
        username: "test_zkldi",
        password: "password",
        captcha: "asdf",
    });

    logger.info("3");

    if (res.status !== 200) {
        logger.crit("Failed to login. Cannot generate auth cookie.");
        throw res.body;
    }
    logger.info("4");

    return res.headers["set-cookie"] as string[];
}

export async function DestroyFakeAuthToken(cookie: string) {
    // stub
}
