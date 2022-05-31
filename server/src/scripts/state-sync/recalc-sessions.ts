import CreateLogCtx from "lib/logger/logger";
import { RecalcSessions } from "utils/calculations/recalc-sessions";

const logger = CreateLogCtx(__filename);

if (require.main === module) {
	RecalcSessions()
		.then(() => process.exit(0))
		.catch((err: unknown) => {
			logger.error(`Failed to recalc sessions.`, { err });
			process.exit(1);
		});
}
