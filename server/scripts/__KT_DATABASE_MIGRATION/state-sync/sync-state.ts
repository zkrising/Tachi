import { CreateGameProfiles } from "./create-game-profiles";
import { UpdateAllPBs } from "./update-all-pbs";
import { RecalcAllScores } from "./recalc-all-scores";
import CreateLogCtx from "lib/logger/logger";
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
