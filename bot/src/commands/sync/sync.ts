import { SlashCommandBuilder } from "@discordjs/builders";
import { BotConfig } from "../../config";
import { PerformScoreImport } from "../../utils/api-requests";
import { CreateEmbed } from "../../utils/embeds";
import { Pluralise } from "../../utils/misc";
import { SlashCommand } from "../types";

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

		return CreateEmbed()
			.setTitle(
				`Imported ${importDoc.scoreIDs.length} ${Pluralise(
					importDoc.scoreIDs.length,
					"score"
				)}!`
			)
			.addField("Created Sessions", importDoc.createdSessions.length.toString(), true)
			.addField("Errors", importDoc.errors.length.toString(), true)
			.addField(
				"Your Profile",
				`${BotConfig.TACHI_SERVER_LOCATION}/dashboard/users/${importDoc.userID}/games/${importDoc.game}`
			)

			.setTimestamp();
	},
};

export default command;
