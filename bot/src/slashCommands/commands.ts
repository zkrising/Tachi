import chart from "./commands/chart";
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
		chart,
	})
);

if (BotConfig.DISCORD.APPROVED_ROLE) {
	SLASH_COMMANDS.set("letmein", letmein);
}

// ktchi or omni specific commands
if (ServerConfig.type !== "btchi") {
	SLASH_COMMANDS.set("sync", sync);
}

// btchi or omni specific commands
if (ServerConfig.type !== "ktchi") {
	SLASH_COMMANDS.set("invite", invite);
}
