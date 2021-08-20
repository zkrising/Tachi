import { Client, Intents } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "@discordjs/builders";
import { LoggerLayers, platformRegex } from "./config";
import { createLinkReply } from "./createEmbed/createEmbed";
import { getSongLinkResponse } from "./getSongLink/getSongLink";
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

	if (interaction.commandName === "help") {
		/** @TODO Prettify this! */
		await interaction.reply("Send a link to a streaming service and I will reply with a rich embed.\nPrepend youtube links with `?`\n\nGithub: https://github.com/Puffycheeses/music_linkr\nDiscord: https://discord.gg/a5a7NQV");
	}
});

const rest = new REST({ version: "9" }).setToken(process.env.DISCORDTOKEN);
client.login(process.env.DISCORDTOKEN).then(() => {
	logger.info("Logged in successfully \n");
}).catch((err) => {
	logger.error("Log in Failed:", err);
}).then(() => {
	client.guilds.cache.map(async (guild) => {
		try {
			logger.info(`Registering Slash command with ${guild.id}`);
			await rest.put(
				Routes.applicationGuildCommands(client.application.id, guild.id),
				{
					body: [
						new SlashCommandBuilder()
							.setName("help")
							.setDescription("Shows information about Music Linkr")
							.toJSON()
					]
				}
			);
		} catch (e) {
			logger.error(`Error on Guild: ${guild.id}`, e);
		}
	});
});

