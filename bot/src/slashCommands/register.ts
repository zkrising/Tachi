import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Client } from "discord.js";
import { SLASH_COMMANDS } from "./commands";
import { BotConfig } from "../config";
import { LoggerLayers } from "../data/data";
import { CreateLayeredLogger } from "../utils/logger";

const logger = CreateLayeredLogger(LoggerLayers.slashCommands);

const rest = new REST({
	version: "9",
}).setToken(BotConfig.DISCORD.TOKEN);

/**
 * Register our slash commands. If in prod, these
 * @param client
 */
export async function RegisterSlashCommands(client: Client): Promise<void> {
	try {
		const commandsArray = [...SLASH_COMMANDS.values()];

		await UnregisterAllCommands(client);

		logger.info("Registering guild slash commands.");

		await rest.put(
			Routes.applicationGuildCommands(client.application!.id, BotConfig.DISCORD.SERVER_ID),
			{
				body: commandsArray.map((command) => command.info),
			}
		);

		logger.info("Successfully registered guild slash commands.");
	} catch (err) {
		logger.error("Failed to register guild slash commands.", err);
		throw err;
	}
}

/**
 * Unregister all the commmands we have.
 */
export async function UnregisterAllCommands(client: Client): Promise<void> {
	try {
		logger.info("Tidying old guild slash commands.");
		const guilds = client.guilds.cache;

		// discord.js doesn't use arrays because those aren't cool anymore
		// so we have to discard the left side of this.
		// They use collections, which inherit from ES6's Map. Ah well.

		const promises = [];
		for (const [, guild] of guilds) {
			const commands = guild.commands.cache;

			for (const [, command] of commands) {
				promises.push(command.delete());
			}
		}

		// parallelise waiting for these to be deleted.
		await Promise.all(promises);

		logger.info("Successfully tidied old guild slash commands.");
	} catch (err) {
		logger.error("Failed to tidy old guild slash commands.", err);

		throw err;
	}
}
