import t from "tap";
import { GetMilisecondsSince } from "./hrtime-core";

t.test("#GetMilisecondsSince", (t) => {
    let time = GetMilisecondsSince(10n);
    t.ok(typeof time === "number" && time > 0, "Should return a number greater than 0.");

    t.end();
});
