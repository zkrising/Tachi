import t from "tap";
import mockApi from "../../test-utils/mock-api";
import { TestingIIDXEamusementCSV26 } from "../../test-utils/test-data";
import { CloseAllConnections } from "../../test-utils/close-connections";
import { RequireNeutralAuthentication } from "../../test-utils/api-common";
import { CreateFakeAuthCookie } from "../../test-utils/fake-session";
import test from "why-is-node-running";
import ResetDBState from "../../test-utils/reset-db-state";
import { rootLogger } from "../../logger";

t.test("POST /internal-api/import/file", async (t) => {
    const cookie = await CreateFakeAuthCookie(mockApi);
    rootLogger.info("start t.test");
    t.beforeEach(ResetDBState);

    rootLogger.info("start neutral auth");

    t.test(`Testing authentication for POST /internal-api/import/file`, async (t) => {
        let res = await mockApi.post("/internal-api/import/file");

        t.equal(res.status, 401, "Should return 401 immediately.");
        t.equal(
            res.body.description,
            "You are not authorised to perform this action.",
            "Should return an appropriate error message."
        );

        rootLogger.debug("end neutral auth");
        t.end();
    });

    t.test("csv:eamusement-iidx", (t) => {
        t.test("Valid Rootage CSV import", async (t) => {
            rootLogger.info("import 1");
            let res = await mockApi
                .post("/internal-api/import/file")
                .set("Cookie", cookie)
                .attach("scoreData", TestingIIDXEamusementCSV26, "my_csv.csv")
                .field("importType", "csv:eamusement-iidx")
                .field("playtype", "SP");

            rootLogger.info("import 2");

            t.strictSame(
                res.body,
                {
                    success: true,
                    description: "foo",
                },
                "Should return information of a success."
            );

            rootLogger.info("import 3");
            t.end();
        });

        t.end();
    });

    t.end();
});

setTimeout(() => {
    test();
}, 10000);

t.teardown(CloseAllConnections);
