import { Client, Intents } from "discord.js";
import { handleIsCommand } from "./interactionHandlers/command/handleIsCommand";
import { handleIsSelectMenu } from "./interactionHandlers/selectMenu/handleIsSelectMenu";
import { app } from "./server/server";
import { BotConfig, ProcessEnv } from "./setup";
import { LoggerLayers, theFunny } from "./config";
import { registerSlashCommands } from "./slashCommands/register";
import { getTachiIdByDiscordId } from "./utils/discord-to-tachi";
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
		const TachiObject = await getTachiIdByDiscordId(interaction.user.id);
		const oAuthLink = `https://kamaitachi.xyz/oauth/request-auth?clientID=${process.env.BOT_CLIENT_ID}&context=${interaction.user.id}`;
		if (interaction.isSelectMenu()) {
			if (!TachiObject) {
				await (await interaction.user.createDM()).send(`Please log in: ${oAuthLink}`);
				return await interaction.reply("Please link your discord account, You have been messaged a URL");
			}
			return await handleIsSelectMenu(interaction);
		}

		if (interaction.isCommand()) {
			if (!TachiObject) {
				await (await interaction.user.createDM()).send(`Please log in: ${oAuthLink}`);
				return await interaction.reply("Please link your discord account, You have been messaged a URL");
			}
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
		app.listen(BotConfig.SERVER_PORT);
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
