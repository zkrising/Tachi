import { CommandInteraction } from "discord.js";
import { DiscordUserMapDocument } from "../database/mongo";

export type Command = (
	interaction: CommandInteraction,
	requestingUser: DiscordUserMapDocument
) => Promise<void>;
