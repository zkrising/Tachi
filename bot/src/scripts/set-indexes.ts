import { SetIndexes } from "../database/mongo";

if (require.main === module) {
	void (async () => {
		await SetIndexes(true);
		process.exit(0);
	})();
}
