import { GetUserInfo } from "./apiRequests";
import { ConvertInputIntoGenerousRegex, ParseGPT } from "./misc";
import { GetGamePTConfig } from "tachi-common";
import type { DiscordUserMapDocument } from "../database/documents";
import type { Emittable } from "../slashCommands/types";
import type { CommandInteraction } from "discord.js";
import type { Difficulties, Game, IDStrings, Playtype, PublicUserDocument } from "tachi-common";

/**
 * Utility parser for getting the game, playtype and requesting user, since this is
 * a common pattern in the bot.
 */
export async function GetGPTAndUser(
	interaction: CommandInteraction,
	requestingUser: DiscordUserMapDocument
): Promise<
	| { error: Emittable }
	| { error: null; content: { userDoc: PublicUserDocument; game: Game; playtype: Playtype } }
> {
	const userID = interaction.options.getString("other_user") ?? requestingUser.userID.toString();

	if (!/^[a-zA-Z0-9_-]{0,20}$/u.test(userID)) {
		return { error: `Invalid userID. Can't query this!` };
	}

	let userDoc;

	try {
		userDoc = await GetUserInfo(userID);
	} catch (err) {
		return { error: `This user does not exist.` };
	}

	const { game, playtype } = ParseGPT(interaction.options.getString("game", true));

	return { error: null, content: { userDoc, game, playtype } };
}

/**
 * Converts arbitrary user input into a valid difficulty for this GPT.
 */
export function ParseDifficulty(
	game: Game,
	playtype: Playtype,
	input: string | null
): Difficulties[IDStrings] | null {
	if (input === null || game === "bms" || game === "pms") {
		return null;
	}

	const gptConfig = GetGamePTConfig(game, playtype);

	const regex = ConvertInputIntoGenerousRegex(input);

	if (game === "iidx" && (input.startsWith("SP") || input.startsWith("DP"))) {
		// some users like to prefix their input with SP -> SPA or SPL, as examples.
		// strip that out if they try to do it, since no IIDX difficulty starts with SP.
		// eslint-disable-next-line no-param-reassign
		input = input.slice(2);
	}

	for (const diff of gptConfig.difficulties) {
		if (diff.match(regex)) {
			return diff;
		}
	}

	throw new Error(`The difficulty '${input}' was invalid for this game.`);
}

/**
 * Converts arbitrary user input into a lamp or grade for this GPT.
 */
export function ParseTimelineTarget(game: Game, playtype: Playtype, input: string) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const regex = ConvertInputIntoGenerousRegex(input);

	for (const [index, grade] of Object.entries(gptConfig.grades)) {
		if (grade.match(regex)) {
			return { type: "grade", value: Number(index) };
		}
	}

	for (const [index, lamp] of Object.entries(gptConfig.lamps)) {
		if (lamp.match(regex)) {
			return { type: "lamp", value: Number(index) };
		}
	}

	throw new Error(`The target '${input}' was invalid for this game.`);
}
