import t from "tap";
import { CloseMongoConnection } from "../../../db/db";
import ResetDBState from "../../../test-utils/reset-db-state";
import { UpdateUsersMilestones } from "./milestones";

t.todo("#UpdateUsersMilestones", (t) => {
    t.beforeEach(ResetDBState);

    t.end();
});

t.teardown(CloseMongoConnection);
