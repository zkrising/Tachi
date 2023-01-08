import type { ClassProvider } from "lib/score-import/framework/calculated-data/types";
import type { integer } from "tachi-common";

export function CreateFerStaticClassProvider(body: Record<string, unknown>): ClassProvider {
	return (gptString, userID, ratings, logger) => {
		let index;

		if (gptString === "iidx:SP") {
			index = body.sp_dan;
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
