import { CommandInteraction } from "discord.js";
import _ from "lodash";
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
import { ParseGPT } from "./misc";

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
	if (input === null) {
		return null;
	}

	const gptConfig = GetGamePTConfig(game, playtype);

	const inputSafeRegex = _.escapeRegExp(input);

	// for any non-ascii charts, replace them with a ".?", representing maybe. This
	// is so users can say things like "Re Master" or "Remaster" for "Re:Master".
	// It also generally gives lenience.
	// We match based on what the string starts with case-insensitively.
	// "A" will match "ANOTHER", but not "NORMAL".
	const regex = new RegExp(`^${inputSafeRegex.replace(/[^a-zA-Z]/gu, ".?")}`, "iu");

	for (const diff of gptConfig.difficulties) {
		if (diff.match(regex)) {
			return diff;
		}
	}

	throw new Error(`The difficulty '${input}' was invalid for this game.`);
}
