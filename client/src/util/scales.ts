import { Game } from "tachi-common";

const scales: Record<Game, number> = {
	iidx: 2,
	bms: 2,
	chunithm: 1,
	ddr: 1,
	gitadora: 1,
	maimai: 1,
	museca: 5,
	sdvx: 5,
	usc: 5,
};

export function GetGradeChartExpScale(game: Game) {
	return scales[game];
}
