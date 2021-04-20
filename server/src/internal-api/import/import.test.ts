import t from "tap";
import mockApi from "../../test-utils/mock-api";
import { TestingIIDXEamusementCSV26 } from "../../test-utils/test-data";
import { CloseAllConnections } from "../../test-utils/close-connections";
import { RequireNeutralAuthentication } from "../../test-utils/api-common";
import { CreateFakeAuthCookie } from "../../test-utils/fake-session";
import ResetDBState from "../../test-utils/reset-db-state";
import { rootLogger } from "../../logger";

t.test("POST /internal-api/import/file", async (t) => {
    const cookie = await CreateFakeAuthCookie(mockApi);
    t.beforeEach(ResetDBState);

    RequireNeutralAuthentication("/internal-api/import/file", "POST");

    t.test("csv:eamusement-iidx", (t) => {
        t.test("Valid Rootage CSV import", async (t) => {
            let res = await mockApi
                .post("/internal-api/import/file")
                .set("Cookie", cookie)
                .attach("scoreData", TestingIIDXEamusementCSV26, "my_csv.csv")
                .field("importType", "csv:eamusement-iidx")
                .field("playtype", "SP");

            t.equal(res.body.success, true);

            t.end();
        });

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
