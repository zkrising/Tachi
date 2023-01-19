import { IIDXDans } from "tachi-common/config/game-support/iidx";
import type { ClassProvider } from "lib/score-import/framework/calculated-data/types";
import type { integer } from "tachi-common";

export function CreateFerStaticClassProvider(body: Record<string, unknown>): ClassProvider {
	return (gptString, userID, ratings, logger) => {
		let index;

		if (gptString === "iidx:SP") {
			index = body.sp_dan;
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		} else if (gptString === "iidx:DP") {
			index = body.dp_dan;
		} else {
			logger.warn(
				`Invalid gptString ${gptString} passed to FerStaticClassProvider. Attempting to continue.`
			);
			return;
		}

		if (index === undefined) {
			return;
		}

		if (!Number.isInteger(index)) {
			logger.info(`received invalid fer-static class of ${index} (${gptString}).`, { body });
			return;
		}

		const dan = IIDXDans[index as integer];

		if (!dan) {
			logger.warn(`Invalid fer-static class of ${index}. Skipping.`);
			return;
		}

		return {
			dan: dan.id,
		};
	};
}
