import CreateLogCtx from "lib/logger/logger";
import { RecalcAllScores, UpdateAllPBs } from "utils/calculations/recalc-scores";
import { CreateGameProfiles } from "./create-game-profiles";
import { RecalcSessions } from "./recalc-sessions";

const logger = CreateLogCtx(__filename);

(async () => {
	await RecalcAllScores();
	await UpdateAllPBs();
	await CreateGameProfiles();
	await RecalcSessions();

	logger.info(`Completely done!`);
	process.exit(0);
})();
