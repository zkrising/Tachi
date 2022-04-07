import { SlashCommandBuilder } from "@discordjs/builders";
import { FormatGame } from "tachi-common";
import { GetMostRecentSession } from "../../utils/apiRequests";
import { GetGPTAndUser } from "../../utils/argParsers";
import { CreateSessionEmbed } from "../../utils/embeds";
import logger from "../../utils/logger";
import { GPTOptions, MakeRequired } from "../../utils/options";
import { SlashCommand } from "../types";

const command: SlashCommand = {
	info: new SlashCommandBuilder()
		.setName("last_session")
		.setDescription("Retrieve your most recent session (even if ongoing).")
		.addStringOption(MakeRequired(GPTOptions))
		.toJSON(),
	exec: async (interaction, requestingUser) => {
		const gptUserInfo = await GetGPTAndUser(interaction, requestingUser);

		if (gptUserInfo.error !== null) {
			return gptUserInfo.error;
		}

		const { userDoc, game, playtype } = gptUserInfo.content;

		let session;
		try {
			session = await GetMostRecentSession(userDoc.id, game, playtype);
		} catch (err) {
			logger.info(err);
			return `You haven't got any sessions for ${FormatGame(game, playtype)}.`;
		}

		return CreateSessionEmbed(session);
	},
};

export default command;
