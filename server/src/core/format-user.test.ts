import { PublicUserDocument } from "kamaitachi-common";
import t from "tap";
import { FormatUserDoc } from "./format-user";

t.test("#FormatUserDoc", (t) => {
    t.is(
        FormatUserDoc({ username: "zkldi", id: 123 } as PublicUserDocument),
        "zkldi (~123)",
        "Should format a user document into username ~id format."
    );

    t.end();
});
