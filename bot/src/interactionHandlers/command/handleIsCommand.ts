import { Interaction } from "discord.js";
import { LoggerLayers } from "../../config";
import { SlashCommand, slashCommands } from "../../slashCommands/register";
import { createLayeredLogger } from "../../utils/logger";

const logger = createLayeredLogger(LoggerLayers.selectInteractionHandler);

export const handleIsCommand = async (interaction: Interaction): Promise<void> => {
	try {
		/** Rechecking required to enforce types */
		if (interaction.isCommand()) {
			const command = slashCommands.find((command: SlashCommand) => {
				return command.info.name === interaction.commandName;
			});

			if (command && command.exec) {
				logger.info(`Running ${command.info.name} interaction`);
				command.exec(interaction);
			}
		}
	} catch (e) {
		logger.error("Failed to handle isCommand interaction");
	}
};
