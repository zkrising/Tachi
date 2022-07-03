import { GetUGPTStats } from "../../utils/apiRequests";
import { GetGPTAndUser } from "../../utils/argParsers";
import { CreateChartScoresEmbed } from "../../utils/embeds";
import logger from "../../utils/logger";
import { GPTOptions, MakeRequired, OtherUserOption } from "../../utils/options";
import { SlashCommandBuilder } from "@discordjs/builders";
import { FormatGame } from "tachi-common";
import type { SlashCommand } from "../types";

const command: SlashCommand = {
	info: new SlashCommandBuilder()
		.setName("last_score")
		.setDescription("Retrieve your most recent score.")
		.addStringOption(MakeRequired(GPTOptions))
		.addStringOption(OtherUserOption)
		.toJSON(),
	exec: async (interaction, requestingUser) => {
		const gptUserInfo = await GetGPTAndUser(interaction, requestingUser);

		if (gptUserInfo.error !== null) {
			return gptUserInfo.error;
		}

		const { userDoc, game, playtype } = gptUserInfo.content;

		let mostRecentScore;

		try {
			({ mostRecentScore } = await GetUGPTStats(userDoc.id, game, playtype));
		} catch (err) {
			logger.info(err);
			return `You haven't played ${FormatGame(game, playtype)}.`;
		}

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
