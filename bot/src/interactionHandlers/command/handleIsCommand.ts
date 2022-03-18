import { Interaction } from "discord.js";
import { LoggerLayers } from "../../config";
import { GetUserForDiscordID } from "../../database/queries";
import { slashCommands } from "../../slashCommands/register";
import { createLayeredLogger } from "../../utils/logger";

const logger = createLayeredLogger(LoggerLayers.slashCommands);

// For performance's sake, create a lookup table here and use that to refer
// to commands.
const COMMAND_LOOKUP_TABLE = new Map();

for (const command of slashCommands) {
	COMMAND_LOOKUP_TABLE.set(command.info.name, command);
}

export async function handleIsCommand(interaction: Interaction) {
	try {
		if (!interaction.isCommand()) {
			throw new Error(`Can't handle command -- interaction was not a command?`);
		}

		const command = COMMAND_LOOKUP_TABLE.get(interaction.commandName);

		if (!command) {
			throw new Error(`A command was requested that does not exist.`);
		}

		const requestingUser = await GetUserForDiscordID(interaction.id);

		if (command) {
			logger.info(`Running ${command.info.name} interaction.`);
			command.exec(interaction, requestingUser);
		}
	} catch (e) {
		logger.error("Failed to handle isCommand interaction", { error: e });
	}
}
