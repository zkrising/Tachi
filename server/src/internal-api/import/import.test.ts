import t from "tap";
import mockApi from "../../test-utils/mock-api";
import { TestingIIDXEamusementCSV26 } from "../../test-utils/test-data";
import { CloseAllConnections } from "../../test-utils/close-connections";

t.test("POST /internal-api/import/file", async (t) => {
    let res = await mockApi.post("/").attach("file", TestingIIDXEamusementCSV26, "my_csv.csv");

    t.end();
});

t.teardown(CloseAllConnections);
