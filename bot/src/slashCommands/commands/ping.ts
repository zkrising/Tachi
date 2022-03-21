import { SlashCommandBuilder } from "@discordjs/builders";
import { ServerConfig } from "../../config";
import { TachiServerV1Get } from "../../utils/fetchTachi";
import { ServerStatus } from "../../utils/returnTypes";
import { SlashCommand } from "../types";

const command: SlashCommand = {
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
			return `Failed to reach ${ServerConfig.name}. (${serverStatus.description})`;
		}

		return `Pong! ${ServerConfig.name} is up, and running ${serverStatus.body.version}.`;
	},
};

export default command;
