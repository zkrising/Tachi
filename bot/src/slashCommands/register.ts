import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Client, CommandInteraction } from "discord.js";
import { searchForSong } from "../commands/chartSearch/chartSearch";
import { HelpCommand } from "../commands/help/help";
import { LoggerLayers } from "../data/data";
import { getProfileByName } from "../profile/fetch";
import { BotConfig, ProcessEnv } from "../setup";
import { createLayeredLogger } from "../utils/logger";
import { gamesToChoicesObject } from "../utils/utils";
import { SlashCommand } from "./types";

const logger = createLayeredLogger(LoggerLayers.slashCommands);

export const SLASH_COMMANDS: Map<string, SlashCommand> = new Map(
	Object.entries({
		help: HelpCommand,
	})
);

const unused = [
	{
		info: new SlashCommandBuilder()
			.setName("profile")
			.setDescription("Displays a Kamaitachi Profile")
			/** @TODO Make this optional once we have a fallback */
			.addIntegerOption((option) =>
				option.setName("user").setDescription("The users id").setRequired(true)
			)
			.addStringOption((option) =>
				option
					.setName("game")
					.setDescription("The Game")
					.setRequired(false)
					.addChoices(gamesToChoicesObject())
			)
			.toJSON(),
		exec: async (interaction: CommandInteraction) => await getProfileByName(interaction),
	},
	{
		info: new SlashCommandBuilder()
			.setName("search")
			.setDescription("Search for a song")
			.addStringOption((option) =>
				option
					.setName("game")
					.setDescription("The Game")
					.setRequired(true)
					.addChoices(gamesToChoicesObject())
			)
			.addStringOption((option) =>
				option.setName("song").setDescription("The song name").setRequired(true)
			)
			.toJSON(),
		exec: async (interaction: CommandInteraction) => await searchForSong(interaction),
	},
];

const rest = new REST({
	version: "9",
}).setToken(BotConfig.DISCORD_TOKEN);

/**
 * Register our slash commands. If in prod, these
 * @param client
 */
export async function RegisterSlashCommands(client: Client): Promise<void> {
	try {
		const commandsArray = Object.values(SLASH_COMMANDS);

		if (ProcessEnv.nodeEnv === "production") {
			logger.info("Registering global slash commands.");

			await rest.put(Routes.applicationCommands(client.application!.id), {
				body: commandsArray.map((command) => command.info),
			});
		} else {
			logger.info("Registering guild slash commands.");

			UnregisterAllCommands(client);

			if (process.env.DEV_SERVER_ID) {
				await rest.put(
					Routes.applicationGuildCommands(
						client.application!.id,
						process.env.DEV_SERVER_ID
					),
					{
						body: commandsArray.map((command) => command.info),
					}
				);
			}
		}

		logger.info("Successfully registered slash commands.");
	} catch (err) {
		logger.error("Failed to register slash commands.", err);
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
