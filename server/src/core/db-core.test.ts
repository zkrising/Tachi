import { GetNextCounterValue } from "./db-core";
import t from "tap";
import db from "../db";
import { CounterDocument } from "kamaitachi-common";

t.test("#GetNextCounterValue", async (t) => {
    t.test("Increments on valid counter hit", async (t) => {
        let response = await GetNextCounterValue("real-counter");

        // database starts with this at one
        t.is(response, 2, "Counter should return an integer");

        let dbData = await db.get<CounterDocument>("counters").findOne({
            counterName: "real-counter",
        });

        t.is(dbData.value, 3, "Counter should increment after being hit");
    });

    t.throws(
        async () => await GetNextCounterValue("fake-counter"),
        "Could not find sequence document for fake-counter."
    );

    t.end();
});
