import { InitaliseFolderChartLookup } from "../../utils/folder";
import CreateLogCtx from "lib/logger/logger";

const logger = CreateLogCtx(__filename);

InitaliseFolderChartLookup()
	.then(() => process.exit(0))
	.catch((err: unknown) => {
		logger.error(`Failed to initialise folder chart lookup.`, { err });
		process.exit(1);
	});
