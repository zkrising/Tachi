import t from "tap";
import { GetMilisecondsSince } from "./hrtime";

t.test("#GetMilisecondsSince", (t) => {
    const time = GetMilisecondsSince(10n);
    t.ok(typeof time === "number" && time > 0, "Should return a number greater than 0.");

    t.end();
});
