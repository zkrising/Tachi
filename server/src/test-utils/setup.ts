import { SetIndexesForDB } from "./resets";
import { monkDB } from "external/mongo/db";

SetIndexesForDB()
	.then(monkDB.close)
	.then(() => process.exit(0));
