import { SlashCommandBuilder } from "@discordjs/builders";
import { GetUGPTStats, GetUserInfo } from "../../utils/apiRequests";
import { GPTOptions, MakeRequired } from "../../utils/choices";
import { CreateGameProfileEmbed } from "../../utils/embeds";
import { ParseGPT } from "../../utils/misc";
import { SlashCommand } from "../types";

const command: SlashCommand = {
	info: new SlashCommandBuilder()
		.setName("profile")
		.setDescription("Retrieve information about a user on a game.")
		.addStringOption(MakeRequired(GPTOptions))
		.addStringOption((str) =>
			str
				.setName("user_id")
				.setDescription(
					"The user who's profiles you want to display. If no user is given, it defaults to you."
				)
		)
		.toJSON(),
	exec: async (interaction, requestingUser) => {
		const userID = interaction.options.getString("user_id") ?? requestingUser.userID.toString();

		if (!/^[a-zA-Z0-9_-]{0,20}$/u.test(userID)) {
			return `Invalid userID. Can't query this!`;
		}

		let userDoc;
		try {
			userDoc = await GetUserInfo(userID);
		} catch (err) {
			return `This user does not exist.`;
		}

		const { game, playtype } = ParseGPT(interaction.options.getString("game", true));

		let ugptStats;
		try {
			ugptStats = await GetUGPTStats(userDoc.id, game, playtype);
		} catch (err) {
			return `This user has not played this game.`;
		}

		return CreateGameProfileEmbed(userDoc, ugptStats);
	},
};

export default command;
