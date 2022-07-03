import { FindFolders } from "../../utils/apiRequests";
import { GetGPTAndUser } from "../../utils/argParsers";
import { CreateFolderStatsEmbed, CreateFolderTimelineEmbed } from "../../utils/embeds";
import { GPTOptions, MakeRequired, OtherUserOption } from "../../utils/options";
import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageSelectMenu, Util } from "discord.js";
import type { SlashCommand } from "../types";
import type { SlashCommandSubcommandBuilder } from "@discordjs/builders";

function ApplyCommonOptions(sub: SlashCommandSubcommandBuilder) {
	return sub
		.addStringOption(MakeRequired(GPTOptions))
		.addStringOption((str) =>
			str
				.setName("folder_name")
				.setDescription("The name of the folder to fetch info on.")
				.setRequired(true)
		);
}

const command: SlashCommand = {
	info: new SlashCommandBuilder()
		.setName("folder")
		.setDescription("Interact with folders.")
		.addSubcommand((sub) =>
			ApplyCommonOptions(sub)
				.setName("stats")
				.setDescription("Retrieve a user's stats on a folder.")
				.addStringOption(OtherUserOption)
		)
		.addSubcommand((sub) =>
			ApplyCommonOptions(sub)
				.setName("timeline")
				.setDescription(
					"Retrieve information about a user's scores in a folder related to a lamp or grade target."
				)
				.addStringOption((str) =>
					str
						.setName("target")
						.setDescription("A lamp or grade to use as a target inside this folder.")
						.setRequired(true)
				)
				.addStringOption((str) =>
					str
						.setName("method")
						.setDescription("What to display about this user's target in this folder.")
						.addChoices([
							["Most Recent", "recent"],
							["First Achieved", "first"],
						])
						.setRequired(true)
				)
				.addStringOption(OtherUserOption)
		)

		.toJSON(),
	exec: async (interaction, requestingUser) => {
		const gptUserInfo = await GetGPTAndUser(interaction, requestingUser);

		if (gptUserInfo.error !== null) {
			return gptUserInfo.error;
		}

		const { userDoc, game, playtype } = gptUserInfo.content;

		const folderName = interaction.options.getString("folder_name", true);

		let folders;

		try {
			folders = await FindFolders(game, playtype, folderName);
		} catch (err) {
			return (err as Error).message;
		}

		if (folders.length === 0) {
			return `Couldn't find any folders with name '${Util.escapeMarkdown(folderName)}'.`;
		}

		// discord caps options at 25.
		if (folders.length > 25) {
			folders = folders.slice(0, 25);
		}

		// pick an initial folder
		const folder = folders[0]!; // length is asserted as non-zero

		// with all of the common info, we now need to chalk up what to actually do.

		const subCommand = interaction.options.getSubcommand() as "stats" | "timeline";

		if (subCommand === "stats") {
			const select = new MessageActionRow().addComponents(
				new MessageSelectMenu()
					.setCustomId(`folder!${game}:${playtype}:${userDoc.username}`)
					.setPlaceholder("Select a different folder.")
					.addOptions(
						folders.map((folder) => ({
							label: folder.title,
							value: folder.folderID,
						}))
					)
			);

			const embed = await CreateFolderStatsEmbed(
				game,
				playtype,
				userDoc.username,
				folder.folderID
			);

			if (folders.length === 1) {
				return { embeds: [embed] };
			}

			return { embeds: [embed], components: [select] };
		}

		const rawTarget = interaction.options.getString("target", true);

		const formatMethod = interaction.options.getString("method", true) as "first" | "recent";

		const select = new MessageActionRow().addComponents(
			new MessageSelectMenu()
				.setCustomId(
					`ftl!${game}:${playtype}:${
						userDoc.username
					}:${formatMethod}:${rawTarget.replace(/:/gu, "_")}`
				)
				.setPlaceholder("Select a different folder.")
				.addOptions(
					folders.map((folder) => ({
						label: folder.title,
						value: folder.folderID,
					}))
				)
		);

		const embed = await CreateFolderTimelineEmbed(
			game,
			playtype,
			userDoc.username,
			folder.folderID,
			formatMethod,
			rawTarget
		);

		if (folders.length === 1) {
			return { embeds: [embed] };
		}

		return { embeds: [embed], components: [select] };
	},
};

export default command;
