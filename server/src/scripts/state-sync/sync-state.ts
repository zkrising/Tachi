import { RecalcGameProfiles } from "./recalc-game-profiles";
import CreateLogCtx from "lib/logger/logger";
import { RecalcAllScores, UpdateAllPBs } from "utils/calculations/recalc-scores";
import { RecalcSessions } from "utils/calculations/recalc-sessions";

const logger = CreateLogCtx(__filename);

(async () => {
	// note: technically some of this stuff is unecessary/duplicate calculation
	// however it's idempotent, so, we should be good.
	await RecalcAllScores();
	await UpdateAllPBs();
	await RecalcGameProfiles();
	await RecalcSessions();

	logger.info(`Completely done!`, () => {
		process.exit(0);
	});
})().catch((err: unknown) => {
	logger.error(`Failed to sync state.`, { err }, () => {
		process.exit(1);
	});
});
