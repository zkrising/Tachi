import t from "tap";
import mockApi from "../../test-utils/mock-api";
import { TestingIIDXEamusementCSV26 } from "../../test-utils/test-data";
import { CloseAllConnections } from "../../test-utils/close-connections";
import { RequireNeutralAuthentication } from "../../test-utils/api-common";
import { CreateFakeAuthCookie } from "../../test-utils/fake-session";
import ResetDBState from "../../test-utils/reset-db-state";

t.test("POST /internal-api/import/file", async (t) => {
    t.beforeEach(ResetDBState);
    const cookie = await CreateFakeAuthCookie();
    function PostImportFile() {
        return mockApi.post("/internal-api/import/file").set("Cookie", cookie);
    }

    RequireNeutralAuthentication(t, "/internal-api/import/file", "POST");

    t.test("csv:eamusement-iidx", (t) => {
        t.test("Successful File Upload", async (t) => {
            let res = await PostImportFile()
                .attach("scoreData", TestingIIDXEamusementCSV26, "my_csv.csv")
                .field("importType", "csv:eamusement-iidx")
                .field("playtype", "SP");

            t.strictSame(
                res.body,
                {
                    success: true,
                    description: "foo",
                },
                "Should return information of a success."
            );

            t.end();
        });

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
