import type { DiscordUserMapDocument } from "../database/documents";
import type { APIApplicationCommandOption } from "discord-api-types";
import type {
	CommandInteraction,
	InteractionReplyOptions,
	MessageEmbed,
	MessagePayload,
} from "discord.js";

export type Emittable = InteractionReplyOptions | MessageEmbed | MessagePayload | string;

type Command = (
	interaction: CommandInteraction,
	requestingUser: DiscordUserMapDocument
) => Emittable | Promise<Emittable>;

export interface SlashCommand {
	info: {
		name: string;
		description: string;
		options: Array<APIApplicationCommandOption>;
	};
	exec: Command;
}
