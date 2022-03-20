import { Interaction, SelectMenuInteraction } from "discord.js";
import { Game, Playtypes } from "tachi-common";
import { buildChartEmbed } from "../commands/chartSearch/buildChartEmbed";
import { LoggerLayers } from "../data/data";
import { buildProfileIntractable } from "../profile/buildProfileEmbed";
import { createLayeredLogger } from "../utils/logger";
import { stringToSimpleGameType } from "../utils/utils";

const logger = createLayeredLogger(LoggerLayers.selectInteractionHandler);

export enum validSelectCustomIdPrefaces {
	selectSongForSearch = "selectSongForSearch",
	SelectGameForProfile = "SelectGameForProfile",
}

export type SelectHandlersType = Record<
	validSelectCustomIdPrefaces,
	(interaction: SelectMenuInteraction) => void
>;
export const selectHandlers: SelectHandlersType = {
	[validSelectCustomIdPrefaces.SelectGameForProfile]: async (
		interaction: SelectMenuInteraction
	): Promise<void> => {
		const userId = parseInt(interaction.customId.split(":")[1]);
		await interaction.editReply(
			await buildProfileIntractable(
				userId,
				interaction.user.id,
				stringToSimpleGameType(interaction.values[0])
			)
		);
	},
	[validSelectCustomIdPrefaces.selectSongForSearch]: async <T extends Game>(
		interaction: SelectMenuInteraction
	): Promise<void> => {
		try {
			const interactionValues = interaction.values[0].split(":");
			const embed = await buildChartEmbed({
				songId: interactionValues[0],
				playtype: <Playtypes[T]>interactionValues[1],
				game: <T>interactionValues[2],
				discordUserId: interaction.user.id,
			});
			logger.info("Built new embed");
			await interaction.editReply(embed);
		} catch (e) {
			logger.error(e);
		}
	},
};

export const handleIsSelectMenu = async (interaction: Interaction): Promise<void> => {
	try {
		/** Rechecking required to enforce types */
		if (interaction.isSelectMenu()) {
			await interaction.deferUpdate();
			const customIdPrefix = <validSelectCustomIdPrefaces>interaction.customId.split(":")[0];
			logger.info(`customIdPrefix: ${customIdPrefix}`);
			if (Object.values(validSelectCustomIdPrefaces).includes(customIdPrefix)) {
				await selectHandlers[customIdPrefix](interaction);
			} else {
				logger.info(`Unknown select handler: ${customIdPrefix}`);
			}
		}
		return;
	} catch (e) {
		logger.error(e);
		logger.error("Failed to handle isSelectMenu interaction");
	}
};
