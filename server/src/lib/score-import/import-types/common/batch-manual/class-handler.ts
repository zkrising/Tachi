import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import { GetGPTConfig, GetGamePTConfig } from "tachi-common";
import { ClassToIndex } from "utils/class";
import type { ClassProvider } from "lib/score-import/framework/calculated-data/types";
import type { GamePTConfig, GPTString, ClassRecords, Classes } from "tachi-common";

// Note: This is tested by batch-manuals parser.test.ts.
export function CreateBatchManualClassProvider(
	classes: Partial<Record<Classes[GPTString], string | null>>
): ClassProvider {
	return (gptString, userID, ratings, logger) => {
		const gptConfig = GetGPTConfig(gptString);

		const newObj: Partial<ClassRecords<GPTString>> = {};

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

			newObj[set] = index;
		}

		return newObj;
	};
}
