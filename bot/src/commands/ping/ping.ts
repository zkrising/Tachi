import { SlashCommandBuilder } from "@discordjs/builders";
import { ServerConfig } from "../../config";
import { SlashCommand } from "../../slashCommands/types";
import { TachiServerV1Get } from "../../utils/fetch-tachi";
import { ServerStatus } from "../../utils/return-types";

export const PingCommand: SlashCommand = {
	info: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Checks the status of the bot and the site.")
		.toJSON(),
	exec: async (interaction, requestingUser) => {
		const serverStatus = await TachiServerV1Get<ServerStatus>(
			"/status",
			requestingUser.tachiApiToken
		);

		if (!serverStatus.success) {
			return interaction.reply(
				`Failed to reach ${ServerConfig.name}. (${serverStatus.description})`
			);
		}

		await interaction.reply(
			`Pong! ${ServerConfig.name} is up*, and running ${serverStatus.body.version}.`
		);
	},
};
