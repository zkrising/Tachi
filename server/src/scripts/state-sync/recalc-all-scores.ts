import CreateLogCtx from "lib/logger/logger";
import { RecalcAllScores } from "utils/calculations/recalc-scores";
import { WrapScriptPromise } from "utils/misc";

const logger = CreateLogCtx(__filename);

if (require.main === module) {
	WrapScriptPromise(RecalcAllScores(), logger);
}
