import { CreateGameProfiles } from "./create-game-profiles";
import { UpdateAllPBs } from "./update-all-pbs";
import { RecalcAllScores } from "./recalc-all-scores";
import CreateLogCtx from "lib/logger/logger";

const logger = CreateLogCtx(__filename);

(async () => {
	await RecalcAllScores({ game: "ddr" });
	await UpdateAllPBs({ game: "ddr" });
	await CreateGameProfiles();

	logger.info(`Completely done!`);
	process.exit(0);
})();
