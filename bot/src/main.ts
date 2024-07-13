import { BotConfig, ProcessEnv, ServerConfig } from "./config";
import { LoggerLayers } from "./data/data";
import { GetUserAndTokenForDiscordID } from "./database/queries";
import { handleIsCommand } from "./interactionHandlers/handleIsCommand";
import { app } from "./server/server";
import { RegisterSlashCommands } from "./slashCommands/register";
import { CreateLayeredLogger } from "./utils/logger";
import { VERSION_PRETTY } from "./version";
import { Client, Intents } from "discord.js";
import { GetLimboChannel } from "utils/misc";
import type { CommandInteraction, SelectMenuInteraction } from "discord.js";

// hack: DiscordJS's endpoints sometimes return bigints that end up in our logger.
// when our logger tries to format that content, JSON.stringify fails.
//
// I personally cannot believe that the spec now made JSON.stringify fallible in such
// a common case. It's kind of absurdly ridiculous. But hey ho; monkey patch our way
// out of it.
// @ts-expect-error hack
BigInt.prototype.toJSON = function toJSON() {
	return this.toString();
};

const logger = CreateLayeredLogger(LoggerLayers.client);

export const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES],
});

client.on("guildMemberAdd", async (member) => {
	if (BotConfig.DISCORD.APPROVED_ROLE && BotConfig.DISCORD.LIMBO_CHANNEL) {
		const channel = GetLimboChannel(client);

		await channel.send(
			`Hello! If you already have an account on ${ServerConfig.NAME}, run \`/letmein\` in #limbo to be let in. Otherwise, ask for an invite in #limbo.`
		);
	}
});

client.on("interactionCreate", async (interaction) => {
	try {
		if (!interaction.isSelectMenu() && !interaction.isCommand()) {
			return; // We don't deal with any of these interactions atm.
		}

		const requestingUser = await GetUserAndTokenForDiscordID(interaction.user.id);

		if (!requestingUser) {
			await RequireUserAuth(interaction);
			return;
		}

		if (interaction.isCommand()) {
			await handleIsCommand(interaction, requestingUser);
		}
	} catch (e) {
		await interaction.channel?.send(
			"We failed to handle this request. Are your DMs shut to non-friends?"
		);
		logger.error("Failed to run interaction.", { interaction, e });
	}
});

/**
 * If a user tries to do anything without auth, Tell them to authenticate.
 */
async function RequireUserAuth(interaction: CommandInteraction | SelectMenuInteraction) {
	const oAuthLink = `${BotConfig.TACHI_SERVER_LOCATION}/oauth/request-auth?clientID=${BotConfig.OAUTH.CLIENT_ID}&context=${interaction.user.id}`;

	const dmChannel = await interaction.user.createDM();

	await dmChannel.send(`Click this link to authenticate with ${ServerConfig.NAME}: ${oAuthLink}`);
	return interaction.reply({
		content: `To use the bot, your discord account must be linked to ${ServerConfig.NAME}.
We've sent you a DM with instructions on how to link your account.`,
		ephemeral: true,
	});
}

void (async () => {
	try {
		logger.info(`Booting Tachi Bot ${VERSION_PRETTY}.`);

		// Login to discord.
		await client.login(BotConfig.DISCORD.TOKEN);

		logger.info(`Logged in successfully to ${client.guilds.cache.size} guilds.`);

		// Mount our express server.
		app.listen(ProcessEnv.port);

		logger.info(
			`Invite URL: https://discord.com/api/oauth2/authorize?client_id=${
				client.application!.id
			}&permissions=8&scope=applications.commands%20bot`
		);

		await RegisterSlashCommands(client);
	} catch (err) {
		logger.crit("Failed to properly boot.", err);
		process.exit(1);
	}
})();

// taken from https://nodejs.org/api/process.html#process_event_unhandledrejection
// to avoid future deprecation.
process.on("unhandledRejection", (reason, promise) => {
	// @ts-expect-error reason is an error, and the logger can handle errors
	// it just refuses.
	logger.error(reason, { promise });
});
