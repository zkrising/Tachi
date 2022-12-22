import { SlashCommandBuilder } from "@discordjs/builders";
import { BotConfig } from "config";
import type { SlashCommand } from "../types";

const command: SlashCommand = {
	info: new SlashCommandBuilder()
		.setName("letmein")
		.setDescription("Let yourself into the server.")
		.toJSON(),
	exec: async (interaction) => {
		if (!BotConfig.DISCORD.APPROVED_ROLE) {
			return null; // no-op
		}

		if (!interaction.member) {
			// Somehow got requested by no-user? Shouldn't be possible.
			return null;
		}

		if (Array.isArray(interaction.member.roles)) {
			// No idea why this might happen.
			return "Failed to assign role: `roles` wasn't a RoleManager. (Why? If this ever happens, laugh at zkldi for daring to think this was sensible.)";
		}

		await interaction.member.roles.add(BotConfig.DISCORD.APPROVED_ROLE);

		return null;
	},
};

export default command;
