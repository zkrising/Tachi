import type { ClassHandler } from "../../../framework/user-game-stats/types";
import type { integer } from "tachi-common";

export function CreateFerStaticClassHandler(body: Record<string, unknown>): ClassHandler {
	return (game, playtype, userID, ratings, logger) => {
		let index;

		if (playtype === "SP") {
			index = body.sp_dan;
		} else if (playtype === "DP") {
			index = body.dp_dan;
		} else {
			logger.warn(
				`Invalid playtype ${playtype} passed to FerStaticClassHandler. Attempting to continue.`
			);
			return;
		}

		if (index === undefined) {
			return;
		}

		if (!Number.isInteger(index)) {
			logger.info(`received invalid fer-static class of ${index} (${playtype}).`, { body });
			return;
		}

		const intIndex = index as integer;

		if (intIndex < 0 || intIndex > 18) {
			logger.warn(`Invalid fer-static class of ${index}. Skipping.`);
			return;
		}

		return {
			dan: intIndex,
		};
	};
}
