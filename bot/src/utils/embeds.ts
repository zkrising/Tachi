import { MessageEmbed } from "discord.js";
import { BotConfig, ServerConfig } from "../config";

export function CreateEmbed() {
	return new MessageEmbed().setColor(ServerConfig.type === "ktchi" ? "#e61c6e" : "#527acc");
}
