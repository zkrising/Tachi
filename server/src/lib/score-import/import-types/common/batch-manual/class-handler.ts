import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import { GetGPTConfig } from "tachi-common";
import { ClassToIndex } from "utils/class";
import type { ClassProvider } from "lib/score-import/framework/calculated-data/types";
import type { Classes, GPTString } from "tachi-common";

// Note: This is tested by batch-manuals parser.test.ts.
export function CreateBatchManualClassProvider(
	outerGptString: GPTString,
	classes: Partial<Record<Classes[GPTString], string | null>>
): ClassProvider {
	return (gptString, userID, ratings, logger) => {
		if (outerGptString !== gptString) {
			return {};
		}

		const gptConfig = GetGPTConfig(gptString);

		const newObj: Partial<Record<Classes[GPTString], string>> = {};

		for (const [s, classID] of Object.entries(classes)) {
			if (classID === null) {
				continue;
			}

			const set = s as Classes[GPTString];

			const index = ClassToIndex(gptString, set, classID);

			if (index === null) {
				logger.warn(
					`User passed invalid class of ${classID} for set ${set}. Expected any of ${gptConfig.classes[
						set
					]!.values.map((e) => e.id).join(", ")}`
				);

				throw new ScoreImportFatalError(
					400,
					`Invalid class of ${classID} for set ${set}. Expected any of ${gptConfig.classes[
						set
					]!.values.map((e) => e.id).join(", ")}`
				);
			}

			newObj[set] = classID;
		}

		return newObj;
	};
}
