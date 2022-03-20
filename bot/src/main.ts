import { Client, CommandInteraction, Intents, SelectMenuInteraction } from "discord.js";
import { LoggerLayers, METALLIC_MIND_SPLASHES } from "./data/data";
import { GetUserForDiscordID } from "./database/queries";
import { handleIsCommand } from "./interactionHandlers/command/handleIsCommand";
import { handleIsSelectMenu } from "./interactionHandlers/selectMenu/handleIsSelectMenu";
import { app } from "./server/server";
import { BotConfig, ProcessEnv } from "./setup";
import { registerSlashCommands } from "./slashCommands/register";
import { createLayeredLogger } from "./utils/logger";
import { RFA, TruncateString } from "./utils/misc";
import { initWatchHandler } from "./utils/utils";

const logger = createLayeredLogger(LoggerLayers.client);

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES],
});

client.on("messageCreate", async (message) => {
	// KT1 Easter Egg.
	if (message.content === "!!") {
		await message.channel.send(
			`Invalid Command. (${TruncateString(RFA(METALLIC_MIND_SPLASHES), 500)})`
		);
	}
});

client.on("interactionCreate", async (interaction) => {
	try {
		if (!interaction.isSelectMenu() && !interaction.isCommand()) {
			return; // We don't deal with any of these interactions atm.
		}

		const requestingUser = await GetUserForDiscordID(interaction.id);

		if (!requestingUser) {
			return RequireUserAuth(interaction);
		}

		if (interaction.isSelectMenu()) {
			return handleIsSelectMenu(interaction);
		}

		if (interaction.isCommand()) {
			return handleIsCommand(interaction, requestingUser);
		}
	} catch (e) {
		logger.error("Failed to run interaction");
	}
});

/**
 * If a user tries to do anything without auth, Tell them to authenticate.
 */
async function RequireUserAuth(interaction: CommandInteraction | SelectMenuInteraction) {
	const oAuthLink = `${BotConfig.TACHI_SERVER_LOCATION}/oauth/request-auth?clientID=${process.env.BOT_CLIENT_ID}&context=${interaction.user.id}`;

	const dmChannel = await interaction.user.createDM();
	await dmChannel.send(
		`Click this link to authenticate with ${BotConfig.SERVER_NAME}: ${oAuthLink}`
	);
	return interaction.reply(
		`To use the bot, your discord account must be linked to ${BotConfig.SERVER_NAME}.
We've sent you a DM with instructions on how to link your account.`
	);
}

(async () => {
	try {
		logger.info(`Booting Tachi-Bot with NODE_ENV '${ProcessEnv.nodeEnv}'.`);

		await client.login(BotConfig.DISCORD_TOKEN);

		logger.info(`Logged in successfully to ${client.guilds.cache.size} guilds`);

		initWatchHandler(client);

		// Mount
		app.listen(BotConfig.SERVER_PORT);

		logger.info(
			`Invite URL: https://discord.com/api/oauth2/authorize?client_id=${
				client.application!.id
			}&permissions=8&scope=applications.commands%20bot`
		);

		await registerSlashCommands(client);
	} catch (e) {
		logger.crit("Log in Failed:", e);
		process.exit(1); // screwed.
	}
})();
