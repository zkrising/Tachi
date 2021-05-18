import t from "tap";
import { CloseMongoConnection } from "../../../../db/db";
import ResetDBState from "../../../../test-utils/reset-db-state";
import { ConvertFileMerIIDX } from "./converter";

t.todo("#ConvertFileMerIIDX", (t) => {
    t.beforeEach(ResetDBState);

    // t.test("", (t) => {
    //     t.end();
    // });

    t.end();
});

t.teardown(CloseMongoConnection);
