import { Client, Intents } from "discord.js";
import { handleIsCommand } from "./interactionHandlers/command/handleIsCommand";
import { handleIsSelectMenu } from "./interactionHandlers/selectMenu/handleIsSelectMenu";
import { ProcessEnv } from "./setup";
import { LoggerLayers } from "./config";
import { registerSlashCommands } from "./slashCommands/register";
import { createLayeredLogger } from "./utils/logger";
import { a } from "./utils/utils";

const logger = createLayeredLogger(LoggerLayers.client);

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES]
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
		a(client);
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
