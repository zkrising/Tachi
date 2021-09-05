import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { APIApplicationCommandOption } from "discord-api-types";
import { Routes } from "discord-api-types/v9";
import { Client, CommandInteraction } from "discord.js";
import { ProcessEnv } from "setup";
import { LoggerLayers } from "../config";
import { help } from "../help/help";
import { createLayeredLogger } from "../utils/logger";

const logger = createLayeredLogger(LoggerLayers.slashCommands);

export interface SlashCommand {
	info: {
		name: string;
		description: string;
		options: APIApplicationCommandOption[];
	};
	exec(interaction: CommandInteraction): Promise<void>;
}

export const slashCommands: SlashCommand[] = [
	{
		info: new SlashCommandBuilder().setName("help").setDescription("Shows information about this bot").toJSON(),
		exec: async (interaction: CommandInteraction) => await help(interaction)
	}
];

const rest = new REST({
	version: "9"
}).setToken(ProcessEnv.DISCORD_TOKEN);
export const registerSlashCommands = async (client: Client): Promise<void> => {
	try {
		logger.info("Registering slash commands");
		await rest.put(Routes.applicationCommands(client.application.id), {
			body: slashCommands.map((command) => command.info)
		});
	} catch (e) {
		logger.error("Failed to register slash commands", e);
	} finally {
		logger.info("Successfully registered slash commands");
	}
};

/** @TODO Potentially re-work this to only run on PROD env, handy for DEV env! **/
/** @deprecated Remove once no guilds have legacy commands */
export const tidyGuildCommands = async (client: Client): Promise<void> => {
	try {
		logger.info("Removing legacy slash commands");
		const guilds = client.guilds.cache;
		guilds.forEach((guild) => {
			const commands = guild.commands.cache;
			commands.forEach((command) => {
				command.delete();
			});
		});
	} catch (e) {
		logger.error("Failed to remove legacy slash commands");
	} finally {
		logger.info("Successfully removed legacy slash commands");
	}
};
