/* eslint-disable no-await-in-loop */
import CreateLogCtx from "lib/logger/logger";
import { UpdateAllPBs } from "utils/calculations/recalc-scores";
import { WrapScriptPromise } from "utils/misc";

const logger = CreateLogCtx(__filename);

if (require.main === module) {
	WrapScriptPromise(UpdateAllPBs(), logger);
}
