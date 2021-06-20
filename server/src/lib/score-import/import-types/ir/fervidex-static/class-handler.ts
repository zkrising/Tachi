import { integer } from "tachi-common";
import { ClassHandler } from "../../../framework/user-game-stats/types";

export function CreateFerStaticClassHandler(body: Record<string, unknown>): ClassHandler {
	return (game, playtype, userID, ratings, logger) => {
		let index;

		if (playtype === "SP") {
			index = body.sp_dan;
		} else if (playtype === "DP") {
			index = body.dp_dan;
		} else {
			logger.error(
				`Invalid playtype ${playtype} passed to FerStaticClassHandler. Attempting to continue.`
			);
			return;
		}

		if (!Number.isInteger(index)) {
			logger.info(`Recieved invalid fer-static class of ${index}.`);
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
