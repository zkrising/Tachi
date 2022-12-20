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
	quests: (d) => `${d.name} (${d.questID})`,
	questlines: (d) => `${d.name} (${d.questlineID})`,
	goals: (d) => `${d.name} (${d.goalID})`,
};

for (const game of allSupportedGames) {
	FormatFunctions[`songs-${game}`] = songFormat;
	FormatFunctions[`charts-${game}`] = chartFormat;
}
