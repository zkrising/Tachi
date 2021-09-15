import { Client, Intents } from "discord.js";
import { UserGameStats } from "tachi-common";
import { buildProfileIntractable } from "./profile/buildProfileEmbed";
import { ProcessEnv } from "./setup";
import { LoggerLayers } from "./config";
import { registerSlashCommands, slashCommands, SlashCommand } from "./slashCommands/register";
import { TachiServerV1Get } from "./utils/fetch-tachi";
import { createLayeredLogger } from "./utils/logger";

const logger = createLayeredLogger(LoggerLayers.client);

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES]
});

client.on("interactionCreate", async (interaction) => {
	try {
		if (interaction.isSelectMenu()) {
			/** @TODO Move this to its own handler!
			 * We only have one intractable but for now this works */
			const userId = interaction.customId.split(":")[1];
			const userData = (await TachiServerV1Get<UserGameStats[]>(`/users/${userId}/game-stats`))?.body;
			if (userData) {
				await interaction.update(buildProfileIntractable(userData, userId, interaction.values[0]));
			} else {
				throw new Error("Failed to re-fetch user data! This is a bad sign!");
			}
			return;
		}

		if (!interaction.isCommand()) return;

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
		if (!ProcessEnv.ENV) {
			throw new Error("Environment not configured");
		}

		logger.info(`Running on ${ProcessEnv.ENV} environment`);
		await client.login(ProcessEnv.DISCORD_TOKEN);
		logger.info(`Logged in successfully to ${client.guilds.cache.size} guilds`);
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
