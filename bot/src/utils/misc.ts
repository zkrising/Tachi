import { Client } from "discord.js";
import humaniseDuration from "humanize-duration";
import { DateTime } from "luxon";
import {
	Game,
	GetGameConfig,
	GetGamePTConfig,
	IDStrings,
	Playtype,
	UGSRatingsLookup,
	integer,
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
