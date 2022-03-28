import { CommandInteraction } from "discord.js";
import {
	Difficulties,
	Game,
	GetGamePTConfig,
	IDStrings,
	Playtype,
	PublicUserDocument,
} from "tachi-common";
import { DiscordUserMapDocument } from "../database/documents";
import { Emittable } from "../slashCommands/types";
import { GetUserInfo } from "./apiRequests";
import { ConvertInputIntoGenerousRegex, ParseGPT } from "./misc";

/**
 * Utility parser for getting the game, playtype and requesting user, since this is
 * a common pattern in the bot.
 */
export async function GetGPTAndUser(
	interaction: CommandInteraction,
	requestingUser: DiscordUserMapDocument
): Promise<
	| { error: null; content: { userDoc: PublicUserDocument; game: Game; playtype: Playtype } }
	| { error: Emittable }
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
