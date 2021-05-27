import t from "tap";
import db from "../../../../external/mongo/db";
import { CloseAllConnections } from "../../../../test-utils/close-connections";
import mockApi from "../../../../test-utils/mock-api";
import ResetDBState from "../../../../test-utils/reset-db-state";
import { GetKTDataJSON } from "../../../../test-utils/test-data";
import deepmerge from "deepmerge";

t.test("POST /ir/beatoraja/login", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should correctly return a token for correct credentials", async (t) => {
        const res = await mockApi
            .post("/ir/beatoraja/login")
            .send({
                username: "test_zkldi",
                password: "password",
            })
            .set("X-KtchiIR-Version", "2.0.0");

        t.equal(res.status, 200);
        t.match(res.body.body.token, /^[0-9a-f]{40}$/u, "Should return a 20 byte long token.");

        t.end();
    });

    t.test("Should reject invalid passwords", async (t) => {
        const res = await mockApi
            .post("/ir/beatoraja/login")
            .send({
                username: "test_zkldi",
                password: "invalid",
            })
            .set("X-KtchiIR-Version", "2.0.0");

        t.equal(res.status, 401);
        t.equal(res.body.success, false);
        t.equal(res.body.body, undefined);

        t.end();
    });

    t.test("Should reject X-KtchiIR-Versions", async (t) => {
        const res = await mockApi
            .post("/ir/beatoraja/login")
            .send({
                username: "test_zkldi",
                password: "password",
            })
            .set("X-KtchiIR-Version", "1.2.0");

        t.equal(res.status, 400);
        t.equal(res.body.success, false);
        t.equal(res.body.body, undefined);

        const res2 = await mockApi.post("/ir/beatoraja/login").send({
            username: "test_zkldi",
            password: "password",
        });

        t.equal(res2.status, 400);
        t.equal(res2.body.success, false);
        t.equal(res2.body.body, undefined);

        t.end();
    });

    t.test("Should reject users it cannot find.", async (t) => {
        const res = await mockApi
            .post("/ir/beatoraja/login")
            .send({
                username: "invalid",
                password: "password",
            })
            .set("X-KtchiIR-Version", "2.0.0");

        t.equal(res.status, 404);
        t.equal(res.body.success, false);
        t.equal(res.body.body, undefined);

        t.end();
    });

    t.test("Should reject invalid request bodies.", async (t) => {
        const res = await mockApi
            .post("/ir/beatoraja/login")
            .send({})
            .set("X-KtchiIR-Version", "2.0.0");

        t.equal(res.status, 400);
        t.equal(res.body.success, false);
        t.equal(res.body.body, undefined);

        const res2 = await mockApi
            .post("/ir/beatoraja/login")
            .send({
                username: { $where: "for(;;){}" },
                password: 123,
            })
            .set("X-KtchiIR-Version", "2.0.0");

        t.equal(res2.status, 400);
        t.equal(res2.body.success, false);
        t.equal(res2.body.body, undefined);

        t.end();
    });

    t.end();
});

t.test("POST /ir/beatoraja/submit-score", (t) => {
    t.beforeEach(ResetDBState);

    const scoreReq = GetKTDataJSON("./beatoraja/base.json");

    t.test("Should import a valid score.", async (t) => {
        const res = await mockApi
            .post("/ir/beatoraja/submit-score")
            .set("X-KtchiIR-Version", "2.0.0")
            .set("Authorization", "Bearer token")
            .send(scoreReq);

        t.equal(res.status, 200);

        t.equal(res.body.success, true);
        t.hasStrict(res.body.body, {
            score: {
                scoreData: {
                    score: 1004,
                },
                importType: "ir/beatoraja",
            },
            chart: {
                chartID: "88eb6cc5683e2740cbd07f588a5f3db1db8d467b",
            },
            song: {
                id: 27339,
            },
        } as any);

        const score = await db.scores.findOne(
            { scoreID: res.body.body.score.scoreID },
            { projection: { _id: 0 } }
        );

        t.hasStrict(score, res.body.body.score);

        t.end();
    });

    t.test("Should return an error if invalid client.", async (t) => {
        const res = await mockApi
            .post("/ir/beatoraja/submit-score")
            .set("X-KtchiIR-Version", "2.0.0")
            .set("Authorization", "Bearer token")
            .send(deepmerge(scoreReq, { client: "INVALID" }));

        t.equal(res.status, 400);

        t.equal(res.body.success, false);
        t.match(res.body.description, /Unknown client/u);

        t.end();
    });

    t.test("Should return an error if invalid score.", async (t) => {
        const res = await mockApi
            .post("/ir/beatoraja/submit-score")
            .set("X-KtchiIR-Version", "2.0.0")
            .set("Authorization", "Bearer token")
            .send(deepmerge(scoreReq, { score: { exscore: -1 } }));

        t.equal(res.status, 400);

        t.equal(res.body.success, false);
        t.match(res.body.description, /Invalid Beatoraja Import - Score/u);

        t.end();
    });

    t.test("Should return an error if invalid chart.", async (t) => {
        const res = await mockApi
            .post("/ir/beatoraja/submit-score")
            .set("X-KtchiIR-Version", "2.0.0")
            .set("Authorization", "Bearer token")
            .send(deepmerge(scoreReq, { chart: { title: null } }));

        t.equal(res.status, 400);

        t.equal(res.body.success, false);
        t.match(res.body.description, /Invalid Beatoraja Import - Chart/u);

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
