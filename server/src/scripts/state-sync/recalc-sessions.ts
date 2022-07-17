import CreateLogCtx from "lib/logger/logger";
import { RecalcSessions } from "utils/calculations/recalc-sessions";
import { WrapScriptPromise } from "utils/misc";

const logger = CreateLogCtx(__filename);

if (require.main === module) {
	WrapScriptPromise(RecalcSessions(), logger);
}
