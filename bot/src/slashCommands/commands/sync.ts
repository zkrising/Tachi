import { PerformScoreImport } from "../../utils/apiRequests";
import { CreateImportEmbed } from "../../utils/embeds";
import { SlashCommandBuilder } from "@discordjs/builders";
import type { SlashCommand } from "../types";

const command: SlashCommand = {
	info: new SlashCommandBuilder()
		.setName("sync")
		.setDescription("Synchronise your scores with another service.")
		.addStringOption((str) =>
			str
				.setName("service")
				.setRequired(true)
				.setDescription("The service to synchronise scores with.")
				.addChoices([
					["FLO IIDX", "api/flo-iidx"],
					["FLO SDVX", "api/flo-sdvx"],
					["EAG IIDX", "api/eag-iidx"],
					["EAG SDVX", "api/eag-sdvx"],
					["MIN SDVX", "api/min-sdvx"],
					["ARC IIDX", "api/arc-iidx"],
					["ARC SDVX", "api/arc-sdvx"],
				])
		)
		.toJSON(),
	exec: async (interaction, requestingUser) => {
		await interaction.reply(`Importing scores...`);

		const importType = interaction.options.getString("service", true);

		const importDoc = await PerformScoreImport(
			`/import/from-api`,
			requestingUser.tachiApiToken,
			{
				importType,
			},
			interaction
		);

		return CreateImportEmbed(importDoc);
	},
};

export default command;
