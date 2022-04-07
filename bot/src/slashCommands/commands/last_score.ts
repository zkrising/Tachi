import { SlashCommandBuilder } from "@discordjs/builders";
import { GetUGPTStats } from "../../utils/apiRequests";
import { GetGPTAndUser } from "../../utils/argParsers";
import { CreateChartScoresEmbed } from "../../utils/embeds";
import { GPTOptions, MakeRequired } from "../../utils/options";
import { SlashCommand } from "../types";

const command: SlashCommand = {
	info: new SlashCommandBuilder()
		.setName("last_score")
		.setDescription("Retrieve your most recent score.")
		.addStringOption(MakeRequired(GPTOptions))
		.toJSON(),
	exec: async (interaction, requestingUser) => {
		const gptUserInfo = await GetGPTAndUser(interaction, requestingUser);

		if (gptUserInfo.error !== null) {
			return gptUserInfo.error;
		}

		const { userDoc, game, playtype } = gptUserInfo.content;

		const { mostRecentScore } = await GetUGPTStats(userDoc.id, game, playtype);

		return CreateChartScoresEmbed(
			userDoc,
			game,
			playtype,
			mostRecentScore.chartID,
			mostRecentScore
		);
	},
};

export default command;
