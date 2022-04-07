import { ServerConfig } from "../config";
import chart from "./commands/chart";
import faq from "./commands/faq";
import folder from "./commands/folder";
import ping from "./commands/ping";
import profile from "./commands/profile";
import quote from "./commands/quote";
import sync from "./commands/sync";
import whois from "./commands/whois";
import invite from "./commands/invite";
import last_score from "./commands/last_score";
import last_session from "./commands/last_session";
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
		last_score,
		last_session,
	})
);

// ktchi or omni specific commands
if (ServerConfig.type !== "btchi") {
	SLASH_COMMANDS.set("sync", sync);
}

// btchi or omni specific commands
if (ServerConfig.type !== "ktchi") {
	SLASH_COMMANDS.set("invite", invite);
	// None. Yet!
}
