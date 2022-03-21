import { PingCommand } from "./ping/ping";
import { SlashCommand } from "./types";

export const SLASH_COMMANDS: Map<string, SlashCommand> = new Map(
	Object.entries({
		ping: PingCommand,
	})
);
