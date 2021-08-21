import { Client, Intents } from "discord.js";
import { LoggerLayers, platformRegex } from "./config";
import { createLinkReply } from "./createEmbed/createEmbed";
import { getSongLinkResponse } from "./getSongLink/getSongLink";
import { registerSlashCommands, slashCommands, tidyGuildCommands, SlashCommand } from "./slashCommands/register";
import { createLayeredLogger } from "./utils/logger";
import { shouldReply } from "./utils/utils";

const logger = createLayeredLogger(LoggerLayers.client);

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGES
	]
});

client.on("messageCreate", async (message) => {
	try {
		if (shouldReply(message)) {
			if (new RegExp(platformRegex.join("|")).test(message.content)) {
				logger.info("Received valid message");
				const services = message.content.match(/\bhttps?:\/\/\S+/gi);

				for (let i = 0; i < services.length; i++) {
					const data = await getSongLinkResponse(services[i]);
					await message.channel.send(createLinkReply(data));
				}

				logger.info("Complete \n");
			}
		}
	} catch (e) {
		logger.error("messageCreate Error:", e);
	}

	return;
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

