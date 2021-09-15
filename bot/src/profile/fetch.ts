import { CommandInteraction } from "discord.js";
import { LoggerLayers } from "../config";
import { BotConfig } from "../setup";
import { TachiServerV1Get } from "../utils/fetch-tachi";
import { createLayeredLogger } from "../utils/logger";
import { UserGameStats } from "tachi-common";
import { buildProfileIntractable } from "./buildProfileEmbed";

const logger = createLayeredLogger(LoggerLayers.profile);

export const getProfileByName = async (interaction: CommandInteraction): Promise<void> => {
	try {
		const userId = interaction.options.getString("user", false) || "TODO FALLBACK TO SELF";
		logger.info(`Fetching user ${userId}`);

		const userData = (await TachiServerV1Get<UserGameStats[]>(`/users/${userId}/game-stats`))?.body;
		logger.verbose(userData);

		if (userData) {
			await interaction.reply(buildProfileIntractable(userData, userId));
		} else {
			await interaction.reply("No user data found for user");
		}
	} catch (e) {
		logger.error(e);
		await interaction.reply(BotConfig.GENERIC_ERROR_MESSAGE);
	}
};
