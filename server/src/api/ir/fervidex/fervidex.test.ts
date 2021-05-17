import t from "tap";
import db from "../../../db/db";
import { CloseAllConnections } from "../../../test-utils/close-connections";
import { CreateFakeAuthCookie } from "../../../test-utils/fake-session";
import mockApi from "../../../test-utils/mock-api";
import ResetDBState from "../../../test-utils/reset-db-state";
import { GetKTDataJSON } from "../../../test-utils/test-data";

function TestSoftwareModels(cookie: string[]) {
    t.test("Should reject invalid X-Software-Models", async (t) => {
        let res = await mockApi
            .post("/api/ir/fervidex/score/submit")
            .set("Cookie", cookie)
            // rootage
            .set("X-Software-Model", "LDJ:J:B:A:2019090200")
            .send(GetKTDataJSON("./fervidex/base.json"));

        t.equal(res.body.success, false, "Should reject rootage clients");

        res = await mockApi
            .post("/api/ir/fervidex/score/submit")
            .set("Cookie", cookie)
            // rootage old
            .set("X-Software-Model", "LDJ:J:B:A:2019100700")
            .send(GetKTDataJSON("./fervidex/base.json"));

        t.equal(res.body.success, false, "Should reject rootage clients");

        res = await mockApi
            .post("/api/ir/fervidex/score/submit")
            .set("Cookie", cookie)
            // cannonballers
            .set("X-Software-Model", "LDJ:J:B:A:2018091900")
            .send(GetKTDataJSON("./fervidex/base.json"));

        t.equal(res.body.success, false, "Should reject cannonballers clients");

        res = await mockApi
            .post("/api/ir/fervidex/score/submit")
            .set("Cookie", cookie)
            .set("X-Software-Model", "LDJ:J:B:A:NONSENSE")
            .send(GetKTDataJSON("./fervidex/base.json"));

        t.equal(res.body.success, false, "Should reject nonsense versions");

        res = await mockApi
            .post("/api/ir/fervidex/score/submit")
            .set("Cookie", cookie)
            // BMS-iidx
            .set("X-Software-Model", "LDJ:J:B:Z:2020092900")
            .send(GetKTDataJSON("./fervidex/base.json"));

        t.equal(res.body.success, false, "Should reject BMS-iidx clients");

        t.end();
    });
}

t.test("POST /api/ir/fervidex/class/submit", async (t) => {
    const cookie = await CreateFakeAuthCookie(mockApi);

    TestSoftwareModels(cookie);

    t.beforeEach(ResetDBState);

    t.end();
});

t.test("POST /api/ir/fervidex/score/submit", async (t) => {
    const cookie = await CreateFakeAuthCookie(mockApi);

    t.beforeEach(ResetDBState);
    TestSoftwareModels(cookie);

    t.test("Should import a valid score", async (t) => {
        let res = await mockApi
            .post("/api/ir/fervidex/score/submit")
            .set("Cookie", cookie)
            .set("X-Software-Model", "LDJ:J:B:A:2020092900")
            .send(GetKTDataJSON("./fervidex/base.json"));

        t.equal(res.body.success, true, "Should be successful");

        t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

        let scores = await db.scores.count({
            service: "Fervidex",
        });

        t.equal(scores, 1, "Should import 1 score.");

        t.end();
    });

    t.test("Should import a valid score with 2dx-gsm", async (t) => {
        let res = await mockApi
            .post("/api/ir/fervidex/score/submit")
            .set("Cookie", cookie)
            .set("X-Software-Model", "LDJ:J:B:A:2020092900")
            .send(GetKTDataJSON("./fervidex/2dxgsm.json"));

        t.equal(res.body.success, true, "Should be successful");

        t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

        let scores = await db.scores.count({
            service: "Fervidex",
        });

        t.equal(scores, 1, "Should import 1 score.");

        t.end();
    });

    t.test("Should reject an invalid body", async (t) => {
        let res = await mockApi
            .post("/api/ir/fervidex/score/submit")
            .set("Cookie", cookie)
            .send({});

        t.equal(res.body.success, false, "Should not be successful");

        t.end();
    });

    t.end();
});

t.test("POST /api/ir/fervidex/profile/submit", async (t) => {
    const cookie = await CreateFakeAuthCookie(mockApi);

    t.beforeEach(ResetDBState);
    TestSoftwareModels(cookie);

    let ferStaticBody = GetKTDataJSON("./fervidex-static/base.json");

    t.test("Should accept a fervidex-static body", async (t) => {
        await db.songs.iidx.remove({});
        await db.songs.iidx.insert(GetKTDataJSON("./kamaitachi/ktblack-songs-iidx.json"));
        await db.charts.iidx.remove({});
        await db.charts.iidx.insert(GetKTDataJSON("./kamaitachi/ktblack-charts-iidx.json"));

        let res = await mockApi
            .post("/api/ir/fervidex/profile/submit")
            .set("Cookie", cookie)
            .set("X-Software-Model", "P2D:J:B:A:2020092900")
            .send(ferStaticBody);

        t.equal(res.body.success, true, "Should be successful");

        t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

        let scores = await db.scores.count({
            service: "Fervidex Static",
        });

        t.equal(scores, 3, "Should import 3 scores.");

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
