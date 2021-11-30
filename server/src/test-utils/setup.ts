import { monkDB } from "external/mongo/db";
import { SetIndexesForDB } from "./resets";

SetIndexesForDB()
	.then(monkDB.close)
	.then(() => process.exit(0));
