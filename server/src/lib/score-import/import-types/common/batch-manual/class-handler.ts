import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import { GetGamePTConfig } from "tachi-common";
import type { ClassProvider } from "lib/score-import/framework/profile-calculated-data/types";
import type { GamePTConfig, GPTString, ClassRecords, Classes } from "tachi-common";

// Note: This is tested by batch-manuals parser.test.ts.
export function CreateBatchManualClassProvider(
	classes: Partial<Record<Classes[GPTString], string | null>>
): ClassProvider {
	return (game, playtype, userID, ratings, logger) => {
		const gptConfig = GetGamePTConfig(game, playtype);

		const newObj: Partial<ClassRecords<GPTString>> = {};

		for (const [s, classID] of Object.entries(classes)) {
			if (classID === null) {
				continue;
			}

			const set = s as Classes[GPTString];

			const index = ClassIDToIndex(gptConfig, set, classID);

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

/**
 * Given a gpt classes ID, return its index value.
 *
 * Returns null if the classID doesn't exist.
 * @returns
 */
function ClassIDToIndex(gptConfig: GamePTConfig, classSet: Classes[GPTString], classID: string) {
	const classes = gptConfig.classes[classSet]!;

	const index = classes.values.map((e) => e.id).indexOf(classID);

	if (index === -1) {
		return null;
	}

	return index;
}
