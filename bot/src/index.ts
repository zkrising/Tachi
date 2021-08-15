import { Client, Intents } from "discord.js";
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

client.login(process.env.DISCORDTOKEN).then(() => {
	logger.info("Logged in successfully \n");
}).catch((err) => {
	logger.error("Log in Failed:", err);
});
