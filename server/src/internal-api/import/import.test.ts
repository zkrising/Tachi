import t from "tap";
import mockApi from "../../test-utils/mock-api";
import {
    GetKTDataBuffer,
    GetKTDataJSON,
    TestingIIDXEamusementCSV26,
    TestingIIDXEamusementCSV27,
} from "../../test-utils/test-data";
import { CloseAllConnections } from "../../test-utils/close-connections";
import { RequireNeutralAuthentication } from "../../test-utils/api-common";
import { CreateFakeAuthCookie } from "../../test-utils/fake-session";
import ResetDBState from "../../test-utils/reset-db-state";
import { rootLogger } from "../../logger";
import db from "../../db/db";

async function LoadKTBlackIIDXData() {
    let songs = GetKTDataJSON("./kamaitachi/ktblack-songs-iidx.json");
    let charts = GetKTDataJSON("./kamaitachi/ktblack-charts-iidx.json");

    await db.songs.iidx.remove({});
    await db.songs.iidx.insert(songs);
    await db.charts.iidx.remove({});
    await db.charts.iidx.insert(charts);
}
// reset DB handles the post-stuff

t.test("POST /internal-api/import/file", async (t) => {
    const cookie = await CreateFakeAuthCookie(mockApi);

    t.beforeEach(ResetDBState);

    RequireNeutralAuthentication("/internal-api/import/file", "POST");

    t.test("file/csv:eamusement-iidx", (t) => {
        t.beforeEach(LoadKTBlackIIDXData);

        t.test("Mini HV import", async (t) => {
            let res = await mockApi
                .post("/internal-api/import/file")
                .set("Cookie", cookie)
                .attach(
                    "scoreData",
                    GetKTDataBuffer("./csv-eamusement-iidx/small-hv-file.csv"),
                    "my_csv.csv"
                )
                .field("importType", "file/csv:eamusement-iidx")
                .field("playtype", "SP");

            t.equal(res.body.success, true, "Should be successful.");

            t.equal(res.body.body.errors.length, 0, "Mini HV Import Should have 0 failed scores.");

            t.equal(res.body.body.scoreIDs.length, 2, "Should have 2 successful scores.");

            t.end();
        });

        t.test("Valid Rootage CSV import", async (t) => {
            let res = await mockApi
                .post("/internal-api/import/file")
                .set("Cookie", cookie)
                .attach("scoreData", TestingIIDXEamusementCSV26, "my_csv.csv")
                .field("importType", "file/csv:eamusement-iidx")
                .field("playtype", "SP");

            t.equal(res.body.success, true, "Should be successful.");

            t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

            t.end();
        });

        t.test("Valid Heroic Verse CSV import", async (t) => {
            let res = await mockApi
                .post("/internal-api/import/file")
                .set("Cookie", cookie)
                .attach("scoreData", TestingIIDXEamusementCSV27, "my_csv.csv")
                .field("importType", "file/csv:eamusement-iidx")
                .field("playtype", "SP");

            t.equal(res.body.success, true, "Should be successful.");

            t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

            t.end();
        });

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
