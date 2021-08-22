import { Message } from "discord.js";

export const shouldReply = (message: Message): boolean =>
	message.author.id !== "876320894295887944" &&
  !message.author.bot;
