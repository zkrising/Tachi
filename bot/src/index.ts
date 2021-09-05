import { Client, Intents } from "discord.js";
import { LoggerLayers } from "./config";
import { registerSlashCommands, slashCommands, tidyGuildCommands, SlashCommand } from "./slashCommands/register";
import { createLayeredLogger } from "./utils/logger";

const logger = createLayeredLogger(LoggerLayers.client);

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGES
	]
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;

	try {
		const command = slashCommands.find((command: SlashCommand) => {
			return command.info.name === interaction.commandName;
		});

		if (command && command.exec) {
			logger.info(`Running ${command.info.name} interaction`);
			command.exec(interaction);
		}
	} catch (e) {
		logger.error("Failed to run interaction");
	}
});

(async () => {
	try {
		await client.login(process.env.DISCORDTOKEN);
		logger.info(`Logged in successfully to ${client.guilds.cache.size} guilds`);
	} catch (e) {
		logger.error("Log in Failed:", e);
	} finally {
		await tidyGuildCommands(client);
		await registerSlashCommands(client);
	}
})();

