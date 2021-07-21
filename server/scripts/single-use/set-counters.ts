import { CounterDocument } from "tachi-common";
import db from "../../src/external/mongo/db";

const Counters: CounterDocument[] = [
	{
		counterName: "users",
		value: 1,
	},
];

db.counters.insert(Counters).then(() => {
	process.exit(0);
});
