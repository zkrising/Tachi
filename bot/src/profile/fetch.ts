import { CommandInteraction } from "discord.js";
import { IDStrings } from "tachi-common/js/types";
import { LoggerLayers } from "../config";
import { BotConfig } from "../setup";
import { createLayeredLogger } from "../utils/logger";
import { stringToSimpleGameType } from "../utils/utils";
import { buildProfileIntractable } from "./buildProfileEmbed";

const logger = createLayeredLogger(LoggerLayers.profile);

export const getProfileByName = async (interaction: CommandInteraction): Promise<void> => {
	try {
		/** @TODO this can be an @User, userId or userName!!! Handle this at some point */
		const userId = interaction.options.getString("user", false) || "TODO FALLBACK TO SELF";
		logger.info(`Fetching user ${userId}`);

		const optionalGameOption = <IDStrings | undefined>interaction.options.getString("game", false);
		const game = optionalGameOption ? stringToSimpleGameType(optionalGameOption) : undefined;

		if (userId) {
			await interaction.reply(await buildProfileIntractable(userId, game));
		} else {
			await interaction.reply("No user data found for user");
		}
	} catch (e) {
		logger.error(e);
		await interaction.reply(BotConfig.GENERIC_ERROR_MESSAGE);
	}
};
