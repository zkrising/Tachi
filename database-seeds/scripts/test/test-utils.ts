import { Game } from "tachi-common";
import { allSupportedGames } from "tachi-common/config/static-config";
import { SCHEMAS } from "tachi-common/lib/schemas";
import { ReadCollection } from "../util";

const songMap = {};

for (const game of allSupportedGames) {
	const songs = ReadCollection(`songs-${game}.json`);

	songMap[game] = Object.fromEntries(songs.map((e) => [e.id, e]));
}

const songFormat = (s) => `${s.artist} - ${s.title} (${s.id})`;
const chartFormat = (s, game) =>
	`${songMap[game][s.songID] ? songFormat(songMap[game][s.songID]) : s.songID} - ${s.playtype} ${
		s.difficulty
	} (${s.chartID})`;

export const FormatFunctions: Partial<
	Record<keyof typeof SCHEMAS, (d: any, g: Game | null) => string>
> = {
	"bms-course-lookup": (d) => d.title,
	folders: (d) => d.title,
	tables: (d) => d.title,

	"songs-bms": songFormat,
	"songs-chunithm": songFormat,
	"songs-iidx": songFormat,
	"songs-jubeat": songFormat,
	"songs-maimai": songFormat,
	"songs-museca": songFormat,
	"songs-pms": songFormat,
	"songs-popn": songFormat,
	"songs-sdvx": songFormat,
	"songs-usc": songFormat,
	"songs-wacca": songFormat,
	"songs-itg": songFormat,

	"charts-bms": chartFormat,
	"charts-chunithm": chartFormat,
	"charts-iidx": chartFormat,
	"charts-jubeat": chartFormat,
	"charts-maimai": chartFormat,
	"charts-museca": chartFormat,
	"charts-pms": chartFormat,
	"charts-popn": chartFormat,
	"charts-sdvx": chartFormat,
	"charts-usc": chartFormat,
	"charts-wacca": chartFormat,
	"charts-itg": chartFormat,
};
