import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { APIApplicationCommandOption } from "discord-api-types";
import { Routes } from "discord-api-types/v9";
import { Client, CommandInteraction } from "discord.js";
import { searchForSong } from "../chartSearch/chartSearch";
import { getProfileByName } from "../profile/fetch";
import { ProcessEnv } from "../setup";
import { LoggerLayers } from "../config";
import { help } from "../help/help";
import { createLayeredLogger } from "../utils/logger";
import { gamesToChoicesObject } from "../utils/utils";

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
	},
	{
		info: new SlashCommandBuilder()
			.setName("profile")
			.setDescription("Displays a Kamaitachi Profile")
			/** @TODO Make this optional once we have a fallback */
			.addStringOption((option) => option.setName("user").setDescription("The users id").setRequired(true))
			.addStringOption((option) =>
				option.setName("game").setDescription("The Game").setRequired(false).addChoices(gamesToChoicesObject())
			)
			.toJSON(),
		exec: async (interaction: CommandInteraction) => await getProfileByName(interaction)
	},
	{
		info: new SlashCommandBuilder()
			.setName("search")
			.setDescription("Search for a song")
			.addStringOption((option) =>
				option.setName("game").setDescription("The Game").setRequired(true).addChoices(gamesToChoicesObject())
			)
			.addStringOption((option) => option.setName("song").setDescription("The song name").setRequired(true))
			.toJSON(),
		exec: async (interaction: CommandInteraction) => await searchForSong(interaction)
	}
];

const rest = new REST({
	version: "9"
}).setToken(ProcessEnv.DISCORD_TOKEN);
export const registerSlashCommands = async (client: Client): Promise<void> => {
	try {
		if (process.env.ENV === "PROD") {
			logger.info("Registering global slash commands");

			await rest.put(Routes.applicationCommands(client.application!.id), {
				body: slashCommands.map((command) => command.info)
			});
		} else {
			logger.info("Registering guild slash commands");

			await tidyOldGuildCommands(client);
			if (process.env.DEV_SERVER_ID) {
				await rest.put(Routes.applicationGuildCommands(client.application!.id, process.env.DEV_SERVER_ID), {
					body: slashCommands.map((command) => command.info)
				});
			}
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
