import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { SlashCommand } from "../../slashCommands/types";

export const help = async (interaction: CommandInteraction): Promise<void> => {
	await interaction.reply("This is an example help command");
};

export const HelpCommand: SlashCommand = {
	info: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Shows information about this bot.")
		.toJSON(),
	exec: help,
};
