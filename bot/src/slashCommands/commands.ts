import ping from "./commands/ping";
import quote from "./commands/quote";
import faq from "./commands/faq";
import sync from "./commands/sync";
import { SlashCommand } from "./types";
import { ServerConfig } from "../config";

export const SLASH_COMMANDS: Map<string, SlashCommand> = new Map(
	Object.entries({
		ping,
		quote,
		faq,
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
