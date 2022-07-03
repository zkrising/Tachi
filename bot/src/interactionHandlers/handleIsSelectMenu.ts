import { LoggerLayers } from "../data/data";
import { GetUserInfo } from "../utils/apiRequests";
import {
	CreateChartScoresEmbed,
	CreateFolderStatsEmbed,
	CreateFolderTimelineEmbed,
} from "../utils/embeds";
import { CreateLayeredLogger } from "../utils/logger";
import type { DiscordUserMapDocument } from "../database/documents";
import type { SelectMenuInteraction } from "discord.js";
import type { Game, Playtype } from "tachi-common";

const logger = CreateLayeredLogger(LoggerLayers.slashCommands);

/**
 * Handles incoming command requests by resolving the interaction to the command
 * it refers to, and calling it.
 *
 * @param interaction - The interaction the user made. This contains things like what
 * command they called and with what arguments.
 * @param requestingUser - The user who interacted with this command.
 */
export async function handleIsSelectMenu(
	interaction: SelectMenuInteraction,
	requestingUser: DiscordUserMapDocument
) {
	try {
		if (interaction.user.id !== requestingUser.discordID) {
			await interaction.reply({
				ephemeral: true,
				content: "You can't interact with other peoples select boxes, get your own!",
			});
		}

		if (interaction.customId.startsWith("chart!")) {
			// horrendous hackery, but we only have 100 chars to store selector metadata.
			const [, game, playtype, userID] = /!(.*):(.*):(.*)$/u.exec(
				interaction.customId
			) as unknown as [string, Game, Playtype, string];

			const userDoc = await GetUserInfo(userID);

			const embed = await CreateChartScoresEmbed(
				userDoc,
				game,
				playtype,
				interaction.values[0]!,
				null
			);

			await interaction.update({ embeds: [embed] });
		} else if (interaction.customId.startsWith("folder!")) {
			const [, game, playtype, username] = /!(.*):(.*):(.*)$/u.exec(
				interaction.customId
			) as unknown as [string, Game, Playtype, string];

			const embed = await CreateFolderStatsEmbed(
				game,
				playtype,
				username,
				interaction.values[0]!
			);

			await interaction.update({ embeds: [embed] });
		} else if (interaction.customId.startsWith("ftl!")) {
			const [, game, playtype, username, formatMethod, rawTarget] =
				/!(.*):(.*):(.*):(.*):(.*)$/u.exec(interaction.customId) as unknown as [
					string,
					Game,
					Playtype,
					string,
					"first" | "recent",
					string
				];

			const embed = await CreateFolderTimelineEmbed(
				game,
				playtype,
				username,
				interaction.values[0]!,
				formatMethod,
				rawTarget
			);

			await interaction.update({ embeds: [embed] });
		} else {
			logger.warn(`Unknown selector triggered: ${interaction.customId}.`);
		}
	} catch (e) {
		logger.error("Failed to handle isSelectMenu interaction", { error: e });
	}
}
