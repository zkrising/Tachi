import { Interaction } from "discord.js";
import { UserGameStats } from "tachi-common";
import { LoggerLayers } from "../../config";
import { buildProfileIntractable } from "../../profile/buildProfileEmbed";
import { TachiServerV1Get } from "../../utils/fetch-tachi";
import { createLayeredLogger } from "../../utils/logger";

const logger = createLayeredLogger(LoggerLayers.selectInteractionHandler);

export const handleIsSelectMenu = async (interaction: Interaction): Promise<void> => {
	try {
		/** Rechecking required to enforce types */
		if (interaction.isSelectMenu()) {
			const userId = interaction.customId.split(":")[1];
			const userData = (await TachiServerV1Get<UserGameStats[]>(`/users/${userId}/game-stats`))?.body;
			if (userData) {
				await interaction.update(buildProfileIntractable(userData, userId, interaction.values[0]));
			} else {
				throw new Error("Failed to re-fetch user data! This is a bad sign!");
			}
		}
		return;
	} catch (e) {
		logger.error("Failed to handle isSelectMenu interaction");
	}
};
