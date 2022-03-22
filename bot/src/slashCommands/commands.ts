import { ServerConfig } from "../config";
import chart from "./commands/chart";
import faq from "./commands/faq";
import folder from "./commands/folder";
import ping from "./commands/ping";
import profile from "./commands/profile";
import quote from "./commands/quote";
import sync from "./commands/sync";
import whois from "./commands/whois";
import { SlashCommand } from "./types";

export const SLASH_COMMANDS: Map<string, SlashCommand> = new Map(
	Object.entries({
		ping,
		quote,
		faq,
		whois,
		profile,
		chart,
		folder,
	})
);

// ktchi or omni specific commands
if (ServerConfig.type !== "btchi") {
	SLASH_COMMANDS.set("sync", sync);
}

// btchi or omni specific commands
if (ServerConfig.type !== "ktchi") {
	// None. Yet!
}
