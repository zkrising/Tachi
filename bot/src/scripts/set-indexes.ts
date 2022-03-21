import { SetIndexes } from "../database/mongo";

if (require.main === module) {
	(async () => {
		await SetIndexes(true);
		process.exit(0);
	})();
}
