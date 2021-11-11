import CreateLogCtx from "lib/logger/logger";
import { CreateGameProfiles } from "./create-game-profiles";
import { RecalcAllScores } from "./recalc-all-scores";
import { RecalcSessions } from "./recalc-sessions";
import { UpdateAllPBs } from "./update-all-pbs";

const logger = CreateLogCtx(__filename);

(async () => {
	await RecalcAllScores();
	await UpdateAllPBs();
	await CreateGameProfiles();
	await RecalcSessions();

	logger.info(`Completely done!`);
	process.exit(0);
})();
