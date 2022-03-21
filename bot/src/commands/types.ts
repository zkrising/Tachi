import { APIApplicationCommandOption } from "discord-api-types";
import { CommandInteraction } from "discord.js";
import { DiscordUserMapDocument } from "../database/mongo";

export type Command = (
	interaction: CommandInteraction,
	requestingUser: DiscordUserMapDocument
) => Promise<void>;

export interface SlashCommand {
	info: {
		name: string;
		description: string;
		options: APIApplicationCommandOption[];
	};
	exec: Command;
}
