import { SetIndexesForDB } from "./resets";
import { monkDB } from "external/mongo/db";

SetIndexesForDB()
	.then(monkDB.close)
	.then(() => process.exit(0))
	.catch((err) => {
		// we might not *have* a working logger here
		// eslint-disable-next-line no-console
		console.error(err);
		process.exit(1);
	});
