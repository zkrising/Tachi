import { Message } from "discord.js";
import { allowedChannels } from "../config";

export const shouldReply = (message: Message): boolean =>
	allowedChannels.includes(message.channelId) &&
  message.author.id !== "876320894295887944" &&
  !message.author.bot;
