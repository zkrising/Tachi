import { Interaction, SelectMenuInteraction } from "discord.js";
import { Game, Playtypes } from "tachi-common";
import { buildChartEmbed } from "../../chartSearch/buildChartEmbed";
import { LoggerLayers } from "../../config";
import { buildProfileIntractable } from "../../profile/buildProfileEmbed";
import { createLayeredLogger } from "../../utils/logger";
import { stringToSimpleGameType } from "../../utils/utils";

const logger = createLayeredLogger(LoggerLayers.selectInteractionHandler);

export enum validSelectCustomIdPrefaces {
	selectSongForSearch = "selectSongForSearch",
	SelectGameForProfile = "SelectGameForProfile"
}

export type SelectHandlersType = Record<validSelectCustomIdPrefaces, (interaction: SelectMenuInteraction) => void>;
export const selectHandlers: SelectHandlersType = {
	[validSelectCustomIdPrefaces.SelectGameForProfile]: async (interaction: SelectMenuInteraction): Promise<void> => {
		const userId = interaction.customId.split(":")[1];
		await interaction.update(await buildProfileIntractable(userId, stringToSimpleGameType(interaction.values[0])));
	},
	[validSelectCustomIdPrefaces.selectSongForSearch]: async <T extends Game>(
		interaction: SelectMenuInteraction
	): Promise<void> => {
		const interactionValues = interaction.values[0].split(":");
		await interaction.update(
			await buildChartEmbed({
				songId: interactionValues[0],
				playtype: <Playtypes[T]>interactionValues[1],
				game: <T>interactionValues[2]
			})
		);
	}
};

export const handleIsSelectMenu = async (interaction: Interaction): Promise<void> => {
	try {
		/** Rechecking required to enforce types */
		if (interaction.isSelectMenu()) {
			const customIdPrefix = <validSelectCustomIdPrefaces>interaction.customId.split(":")[0];
			if (Object.values(validSelectCustomIdPrefaces).includes(customIdPrefix)) {
				await selectHandlers[customIdPrefix](interaction);
			}
		}
		return;
	} catch (e) {
		logger.error(e);
		logger.error("Failed to handle isSelectMenu interaction");
	}
};
