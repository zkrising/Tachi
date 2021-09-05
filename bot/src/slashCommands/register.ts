import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { APIApplicationCommandOption } from "discord-api-types";
import { Routes } from "discord-api-types/v9";
import { Client, CommandInteraction } from "discord.js";
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
}).setToken(process.env.DISCORD_TOKEN);
export const registerSlashCommands = async (client: Client): Promise<void> => {
	try {
		if (process.env.ENV === "PROD") {
			logger.info("Registering global slash commands");

			await rest.put(Routes.applicationCommands(client.application.id), {
				body: slashCommands.map((command) => command.info)
			});
		} else {
			logger.info("Registering guild slash commands");

			await tidyOldGuildCommands(client);
			await rest.put(Routes.applicationGuildCommands(client.application.id, process.env.DEV_SERVER_ID), {
				body: slashCommands.map((command) => command.info)
			});
		}

		logger.info("Successfully registered slash commands");
	} catch (e) {
		logger.error("Failed to register slash commands", e);
	}
};

export const tidyOldGuildCommands = async (client: Client): Promise<void> => {
	try {
		logger.info("Tidying old guild slash commands");
		const guilds = client.guilds.cache;
		guilds.forEach((guild) => {
			const commands = guild.commands.cache;
			commands.forEach((command) => {
				command.delete();
			});
		});

		logger.info("Successfully tidied old guild slash commands");
	} catch (e) {
		logger.error("Failed to tidy old guild slash commands");
	}
};
