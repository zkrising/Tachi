import { Client, Intents } from "discord.js";
import { handleIsCommand } from "./interactionHandlers/command/handleIsCommand";
import { handleIsSelectMenu } from "./interactionHandlers/selectMenu/handleIsSelectMenu";
import { ProcessEnv } from "./setup";
import { LoggerLayers, theFunny } from "./config";
import { registerSlashCommands } from "./slashCommands/register";
import { createLayeredLogger } from "./utils/logger";
import { initWatchHandler } from "./utils/utils";

const logger = createLayeredLogger(LoggerLayers.client);

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES]
});

client.on("messageCreate", async (message) => {
	if (message.content === "!!") {
		const index = Math.floor(Math.random() * theFunny.length);
		await message.channel.send(
			theFunny[index].length > 1997 ? theFunny[index].substring(0, 1997).trimEnd() + "..." : theFunny[index]
		);
	}
});

client.on("interactionCreate", async (interaction) => {
	try {
		if (interaction.isSelectMenu()) {
			return await handleIsSelectMenu(interaction);
		}

		if (interaction.isCommand()) {
			return await handleIsCommand(interaction);
		}
	} catch (e) {
		logger.error("Failed to run interaction");
	}
});

(async () => {
	try {
		if (!ProcessEnv.ENV) {
			throw new Error("Environment not configured");
		}

		logger.info(`Running on ${ProcessEnv.ENV} environment`);
		await client.login(ProcessEnv.DISCORD_TOKEN);
		logger.info(`Logged in successfully to ${client.guilds.cache.size} guilds`);
		initWatchHandler(client);
		logger.info(
			`Invite URL: https://discord.com/api/oauth2/authorize?client_id=${
				client.application!.id
			}&permissions=8&scope=applications.commands%20bot`
		);

		await registerSlashCommands(client);
	} catch (e) {
		logger.error("Log in Failed:", e);
	}
})();
