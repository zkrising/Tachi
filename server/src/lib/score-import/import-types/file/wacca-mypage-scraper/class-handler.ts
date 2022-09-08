import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { GetGamePTConfig } from "tachi-common";
import type { ClassHandler } from "../../../framework/user-game-stats/types";
import type { MyPagePlayerStage } from "./types";

const STAGES: Record<number, string> = {
	1: "I",
	2: "II",
	3: "III",
	4: "IV",
	5: "V",
	6: "VI",
	7: "VII",
	8: "VIII",
	9: "IX",
	10: "X",
	11: "XI",
	12: "XII",
	13: "XIII",
	14: "XIV",
};

const waccaStageUpIds = GetGamePTConfig("wacca", "Single").classHumanisedFormat.stageUp.map(
	(e) => e.id
);

export function CreateMyPageScraperClassHandler(stage: MyPagePlayerStage): ClassHandler {
	return (_game, _playtype, _userID, _ratings, logger) => {
		// const classSet: GameClassSets["wacca:Single"] = "stageUp";

		const stageName = STAGES[stage.id];

		if (stageName === undefined) {
			throw new ScoreImportFatalError(400, `Unknown stage up id ${stage.id}.`);
		}

		if (`ステージ${stageName}` !== stage.name) {
			logger.warn(
				`Stage up ${stageName} with id ${stage.id} did not correspond to the CSV name ${stage.name}.`
			);
		}

		const classIndex = waccaStageUpIds.indexOf(stageName);

		if (classIndex < 0) {
			throw new ScoreImportFatalError(
				500,
				`Can't find index for stageUp class id ${stageName}.`
			);
		}

		return {
			stageUp: classIndex,
		};
	};
}
