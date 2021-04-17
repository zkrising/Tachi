import t from "tap";
import mockApi from "../../test-utils/mock-api";
import { TestingIIDXEamusementCSV26 } from "../../test-utils/test-data";
import { CloseAllConnections } from "../../test-utils/close-connections";
import { RequireNeutralAuthentication } from "../../test-utils/api-common";

t.test("POST /internal-api/import/file", (t) => {
    function PostImportFile() {
        return mockApi.post("/internal-api/import/file");
    }

    RequireNeutralAuthentication(t, "/internal-api/import/file", "POST");

    t.test("csv:eamusement-iidx", (t) => {
        t.test("Successful File Upload", async (t) => {
            let res = await PostImportFile().attach(
                "file",
                TestingIIDXEamusementCSV26,
                "my_csv.csv"
            );

            t.strictSame(
                res.body,
                {
                    status: 200,
                    description: "foo",
                },
                "Should return a status code of 200."
            );

            t.end();
        });

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
