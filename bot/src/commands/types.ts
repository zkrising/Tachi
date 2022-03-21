import { APIApplicationCommandOption } from "discord-api-types";
import { CommandInteraction, MessageEmbed, MessagePayload } from "discord.js";
import { DiscordUserMapDocument } from "../database/documents";

export type Emittable = MessagePayload | string | MessageEmbed;

export type Command = (
	interaction: CommandInteraction,
	requestingUser: DiscordUserMapDocument
) => Promise<Emittable> | Emittable;

export interface SlashCommand {
	info: {
		name: string;
		description: string;
		options: APIApplicationCommandOption[];
	};
	exec: Command;
}
