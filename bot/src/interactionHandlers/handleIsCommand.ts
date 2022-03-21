import { CommandInteraction } from "discord.js";
import { SLASH_COMMANDS } from "../commands/commands";
import { LoggerLayers } from "../data/data";
import { DiscordUserMapDocument } from "../database/mongo";
import { CreateLayeredLogger } from "../utils/logger";

const logger = CreateLayeredLogger(LoggerLayers.slashCommands);

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
		const command = SLASH_COMMANDS.get(interaction.commandName);

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
