import { CommandInteraction } from "discord.js";

export const help = async (interaction: CommandInteraction): Promise<void> => {
	await interaction.reply("This is an example help command");
};
