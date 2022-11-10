import type { Snowflake } from "discord.js";
import type { integer } from "tachi-common";

export interface DiscordUserMapDocument {
	userID: integer;
	discordID: Snowflake;
	tachiApiToken: string;
}
