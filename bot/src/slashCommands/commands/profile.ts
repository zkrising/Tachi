import { SlashCommandBuilder } from "@discordjs/builders";
import { GetUGPTStats } from "../../utils/apiRequests";
import { GetGPTAndUser } from "../../utils/argParsers";
import { CreateGameProfileEmbed } from "../../utils/embeds";
import { GPTOptions, MakeRequired, OtherUserOption } from "../../utils/options";
import { SlashCommand } from "../types";

const command: SlashCommand = {
	info: new SlashCommandBuilder()
		.setName("profile")
		.setDescription("Retrieve information about a user on a game.")
		.addStringOption(MakeRequired(GPTOptions))
		.addStringOption(OtherUserOption)
		.toJSON(),
	exec: async (interaction, requestingUser) => {
		const gptUserInfo = await GetGPTAndUser(interaction, requestingUser);

		if (gptUserInfo.error !== null) {
			return gptUserInfo.error;
		}

		const { userDoc, game, playtype } = gptUserInfo.content;

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
