import faq from "./commands/faq";
import invite from "./commands/invite";
import letmein from "./commands/letmein";
import ping from "./commands/ping";
import sync from "./commands/sync";
import whois from "./commands/whois";
import { BotConfig, ServerConfig } from "../config";
import type { SlashCommand } from "./types";

export const SLASH_COMMANDS: Map<string, SlashCommand> = new Map(
	Object.entries({
		ping,
		faq,
		whois,
	})
);

if (BotConfig.DISCORD.APPROVED_ROLE) {
	SLASH_COMMANDS.set("letmein", letmein);
}

// kamaitachi or omni specific commands
if (ServerConfig.TYPE !== "boku") {
	SLASH_COMMANDS.set("sync", sync);
}

// bokutachi or omni specific commands
if (ServerConfig.TYPE !== "kamai") {
	SLASH_COMMANDS.set("invite", invite);
}
