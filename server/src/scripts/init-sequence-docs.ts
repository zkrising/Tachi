import { InitSequenceDocs } from "external/mongo/sequence-docs";
import CreateLogCtx from "lib/logger/logger";

const logger = CreateLogCtx(__filename);

if (require.main === module) {
	InitSequenceDocs()
		.then(() => process.exit(0))
		.catch((err: unknown) => {
			logger.error(`Failed to initialise sequence documents.`, { err }, () => {
				process.exit(1);
			});
		});
}
