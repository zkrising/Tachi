import { Client } from "discord.js";
import humaniseDuration from "humanize-duration";
import { DateTime } from "luxon";
import {
	ChartDocument,
	Game,
	GenericFormatGradeDelta,
	GetGameConfig,
	GetGamePTConfig,
	Grades,
	IDStrings,
	integer,
	PBScoreDocument,
	Playtype,
	Playtypes,
	ScoreCalculatedDataLookup,
	ScoreDocument,
	UGSRatingsLookup,
} from "tachi-common";
import { GameClassSets } from "tachi-common/js/game-classes";
import { BotConfig } from "../config";

/**
 * Random From Array - Selects a random value from an array.
 */
export function RFA<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function TruncateString(string: string, len = 30) {
	if (string.length < len) {
		return string;
	}

	return `${string.substring(0, len - 3)}...`;
}

/**
 * Checks whether a discord user has admin permissions or not. This lets them do
 * slightly more destructive things.
 */
export function IsAdmin(discordID: string) {
	return BotConfig.DISCORD.ADMIN_USERS.includes(discordID);
}

export function Sleep(ms: number) {
	return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
}

export function Pluralise(int: integer, str: string) {
	if (int === 1) {
		return str;
	}

	return `${str}s`;
}

export function FormatProfileRating(
	game: Game,
	playtype: Playtype,
	rating: UGSRatingsLookup[IDStrings],
	value: number | null | undefined
) {
	if (value === null || value === undefined) {
		return "No Data.";
	}

	const formatter = GetGamePTConfig(game, playtype).profileRatingAlgFormatters[rating];

	if (!formatter) {
		return value.toFixed(2);
	}

	return formatter(value);
}

export function FormatScoreRating(
	game: Game,
	playtype: Playtype,
	rating: ScoreCalculatedDataLookup[IDStrings],
	value: number | null | undefined
) {
	if (value === null || value === undefined) {
		return "No Data.";
	}

	const formatter = GetGamePTConfig(game, playtype).scoreRatingAlgFormatters[rating];

	if (!formatter) {
		return value.toFixed(2);
	}

	return formatter(value);
}

/**
 * Typesafe asserted version of Object.entries.
 */
export function Entries<K extends string, V>(rec: Partial<Record<K, V>>): [K, V][] {
	return Object.entries(rec) as [K, V][];
}

export function ParseGPT(str: string) {
	const spl = str.split(":");

	const game = spl[0] as Game;
	const playtype = spl[1] as Playtype;

	const gameConfig = GetGameConfig(game);

	if (!gameConfig || !gameConfig.validPlaytypes.includes(playtype)) {
		throw new Error(`Invalid GPT Combination '${str}'.`);
	}

	return { game, playtype };
}

export function UppercaseFirst(str: string) {
	return str[0].toUpperCase() + str.substring(1);
}

export function MillisToSince(ms: number) {
	return DateTime.fromMillis(ms).toRelative();
}

export function FormatTime(ms: number) {
	return DateTime.fromMillis(ms).toLocaleString(DateTime.DATETIME_MED);
}

export function FormatDate(ms: number) {
	return DateTime.fromMillis(ms).toLocaleString(DateTime.DATE_HUGE);
}

export function FormatDuration(ms: number) {
	return humaniseDuration(ms, {
		units: ["d", "h", "m"],
		maxDecimalPoints: 0,
	});
}

export function FormatTimeSmall(ms: number) {
	return DateTime.fromMillis(ms).toLocaleString(DateTime.DATE_SHORT);
}

export function FormatClass(
	game: Game,
	playtype: Playtype,
	classSet: GameClassSets[IDStrings],
	classValue: integer
) {
	const gptConfig = GetGamePTConfig(game, playtype);

	return gptConfig.classHumanisedFormat[classSet][classValue].display;
}

/**
 * Given a game, return the discord channel it's associated with.
 */
export function GetGameChannel(client: Client, game: Game) {
	const gameChannelID = BotConfig.DISCORD.GAME_CHANNELS[game];

	if (!gameChannelID) {
		throw new Error(
			`Attempted to get channel for ${game}, but no GAME_CHANNEL was registered.`
		);
	}

	const channel = client.channels.cache.find((c) => c.id === gameChannelID);

	if (!channel) {
		throw new Error(`No channel with ID ${gameChannelID} is in the cache for this bot.`);
	}

	if (!channel.isText()) {
		throw new Error(
			`Channel ${gameChannelID} (${game}) is not a text channel. Can't send message.`
		);
	}

	return channel;
}

/**
 * Given a chart and a game, return a link to the site for that chart.
 */
export function CreateChartLink(chart: ChartDocument, game: Game) {
	if (chart.isPrimary) {
		return `${BotConfig.TACHI_SERVER_LOCATION}/dashboard/games/${game}/${
			chart.playtype
		}/songs/${chart.songID}/${encodeURIComponent(chart.difficulty)}`;
	}

	return `${BotConfig.TACHI_SERVER_LOCATION}/dashboard/games/${game}/${chart.playtype}/songs/${chart.songID}/${chart.chartID}`;
}

type ScOrPBDoc<I extends IDStrings> = ScoreDocument<I> | PBScoreDocument<I>;

export function FormatScoreData<I extends IDStrings = IDStrings>(score: ScOrPBDoc<I>) {
	const game = score.game;

	let lampStr: string = score.scoreData.lamp;
	let scoreStr = `${score.scoreData.score.toLocaleString()} (${
		score.scoreData.grade
	}, ${score.scoreData.percent.toFixed(2)}%)`;

	if (game === "iidx" || game === "bms" || game === "pms") {
		const bp = (
			score as ScOrPBDoc<
				"iidx:SP" | "iidx:DP" | "pms:Controller" | "pms:Keyboard" | "bms:14K" | "bms:7K"
			>
		).scoreData.hitMeta.bp;

		lampStr = `${score.scoreData.lamp} (BP: ${bp ?? "No Data"})`;

		const { lower, upper, closer } = GenericFormatGradeDelta(
			game,
			score.playtype,
			score.scoreData.score,
			score.scoreData.percent,
			score.scoreData.grade
		);

		scoreStr = `${closer === "lower" ? lower : upper} (${
			score.scoreData.score
		}, ${score.scoreData.percent.toFixed(2)}%)`;
	}

	return { lampStr, scoreStr };
}

/**
 * Util for getting a games' grade for a given percent.
 */
export function GetGradeFromPercent<I extends IDStrings = IDStrings>(
	game: Game,
	playtype: Playtype,
	percent: number
): Grades[I] {
	const gptConfig = GetGamePTConfig(game, playtype);
	const boundaries = gptConfig.gradeBoundaries;
	const grades = gptConfig.grades;

	if (!boundaries) {
		throw new Error(
			`Invalid call to GetGradeFromPercent! GPT ${game}:${playtype} does not use grade boundaries.`
		);
	}

	// (hey, this for loop is backwards!)
	for (let i = boundaries.length; i >= 0; i--) {
		if (percent + Number.EPSILON >= boundaries[i]) {
			return grades[i] as Grades[I];
		}
	}

	throw new Error(`Couldn't find grade for ${game}:${playtype} (${percent}%)`);
}

export function FormatIIDXEXScore(
	exscore: integer,
	notecount: integer,
	playtype: Playtypes["iidx"]
) {
	const percent = (exscore * 100) / (notecount * 2);

	const { closer, upper, lower } = GenericFormatGradeDelta(
		"iidx",
		playtype,
		exscore,
		percent,
		GetGradeFromPercent("iidx", playtype, percent)
	);

	return `${closer === "lower" ? lower : upper} (${exscore}, ${percent.toFixed(2)}%)`;
}

export function GetChartPertinentInfo<I extends IDStrings>(game: Game, chart: ChartDocument<I>) {
	if (game === "iidx") {
		const ch = chart as ChartDocument<"iidx:DP" | "iidx:SP">;

		if (!ch.data.kaidenAverage || !ch.data.worldRecord) {
			return null;
		}

		return `皆伝 Average: ${FormatIIDXEXScore(
			ch.data.kaidenAverage,
			ch.data.notecount,
			ch.playtype
		)}
e-amusement WR: ${FormatIIDXEXScore(ch.data.worldRecord, ch.data.notecount, ch.playtype)}`;
	}

	return null;
}
