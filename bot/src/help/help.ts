import { CommandInteraction } from "discord.js";

export const help = async (interaction: CommandInteraction): Promise<void> => {
	await interaction.reply("Send a link to a streaming service and I will reply with a rich embed.\nPrepend youtube links with `?`\n\nGithub: https://github.com/Puffycheeses/music_linkr\nDiscord: https://discord.gg/a5a7NQV");
};
