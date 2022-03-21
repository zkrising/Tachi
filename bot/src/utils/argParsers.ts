import { CommandInteraction } from "discord.js";
import { Game, Playtype, PublicUserDocument } from "tachi-common";
import { DiscordUserMapDocument } from "../database/documents";
import { Emittable } from "../slashCommands/types";
import { GetUserInfo } from "./apiRequests";
import { ParseGPT } from "./misc";

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
