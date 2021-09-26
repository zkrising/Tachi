import { Interaction } from "discord.js";
import { LoggerLayers } from "../../config";
import { buildProfileIntractable } from "../../profile/buildProfileEmbed";
import { createLayeredLogger } from "../../utils/logger";
import { stringToSimpleGameType } from "../../utils/utils";

const logger = createLayeredLogger(LoggerLayers.selectInteractionHandler);

export const handleIsSelectMenu = async (interaction: Interaction): Promise<void> => {
	try {
		/** Rechecking required to enforce types */
		if (interaction.isSelectMenu()) {
			/** @TODO Split this out when we add more dropdowns */
			const userId = interaction.customId.split(":")[1];
			await interaction.update(
				await buildProfileIntractable(userId, stringToSimpleGameType(interaction.values[0]))
			);
		}
		return;
	} catch (e) {
		logger.error("Failed to handle isSelectMenu interaction");
	}
};
