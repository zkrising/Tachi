import CreateLogCtx from "lib/logger/logger";
import { PushToS3 } from "lib/cdn/s3";

const logger = CreateLogCtx(__filename);

if (require.main === module) {
	(async () => {
		logger.info("Starting request.");

		const res = await PushToS3("debug/testfile", "foo.txt");

		logger.info("Request done.", res);

		process.exit(0);
	})();
}
