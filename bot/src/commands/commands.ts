import ping from "./ping/ping";
import quote from "./quote/quote";
import faq from "./faq/faq";
import { SlashCommand } from "./types";

export const SLASH_COMMANDS: Map<string, SlashCommand> = new Map(
	Object.entries({
		ping,
		quote,
		faq,
	})
);
