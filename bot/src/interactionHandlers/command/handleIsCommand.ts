import { CommandInteraction, Interaction } from "discord.js";
import { LoggerLayers } from "../../data/data";
import { DiscordUserMapDocument } from "../../database/mongo";
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

/**
 * Handles incoming command requests by resolving the interaction to the command
 * it refers to, and calling it.
 *
 * @param interaction - The interaction the user made. This contains things like what
 * command they called and with what arguments.
 * @param requestingUser - The user who interacted with this command.
 */
export function handleIsCommand(
	interaction: CommandInteraction,
	requestingUser: DiscordUserMapDocument
) {
	try {
		const command = COMMAND_LOOKUP_TABLE.get(interaction.commandName);

		if (!command) {
			throw new Error(`A command was requested that does not exist.`);
		}

		if (command) {
			logger.verbose(`Running ${command.info.name} interaction.`);
			command.exec(interaction, requestingUser);
		}
	} catch (e) {
		logger.error("Failed to handle isCommand interaction", { error: e });
		throw e;
	}
}
