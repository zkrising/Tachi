import { FormatDifficulty, Game, IDStrings } from "tachi-common";
import { ScoreDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { HumanFriendlyStrToLampIndex, HumanFriendlyStrToGradeIndex } from "./str-to-num";
import { ValueGetterOrHybrid } from "./ztable/search";

export function CreateDefaultScoreSearch<I extends IDStrings = IDStrings>(
	game: Game,
	playtype: Playtype
): Record<string, ValueGetterOrHybrid<ScoreDataset<I>[0]>> {
	return {
		artist: x => x.__related.song.artist,
		title: x => x.__related.song.title,
		difficulty: x => FormatDifficulty(x.__related.chart, game),
		level: x => x.__related.chart.levelNum,
		score: x => x.scoreData.score,
		percent: x => x.scoreData.percent,
		lamp: {
			valueGetter: x => [x.scoreData.lamp, x.scoreData.lampIndex],
			strToNum: HumanFriendlyStrToLampIndex(game, playtype),
		},
		grade: {
			valueGetter: x => [x.scoreData.grade, x.scoreData.gradeIndex],
			strToNum: HumanFriendlyStrToGradeIndex(game, playtype),
		},
	};
}
