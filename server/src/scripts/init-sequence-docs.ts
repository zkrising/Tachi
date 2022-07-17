import { InitSequenceDocs } from "external/mongo/sequence-docs";
import CreateLogCtx from "lib/logger/logger";
import { WrapScriptPromise } from "utils/misc";

const logger = CreateLogCtx(__filename);

if (require.main === module) {
	WrapScriptPromise(InitSequenceDocs(), logger);
}
