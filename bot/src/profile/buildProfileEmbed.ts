import { InteractionReplyOptions, MessageActionRow, MessageEmbed, MessagePayload, MessageSelectMenu } from "discord.js";
import { Game, UserGameStats } from "tachi-common";
import { IDStrings, PublicUserDocument, UGSRatingsLookup } from "tachi-common/js/types";
import { find } from "lodash";
import { LoggerLayers } from "../config";
import { TachiServerV1Get } from "../utils/fetch-tachi";
import { createLayeredLogger } from "../utils/logger";
import {
	formatGameWrapper,
	getPfpUrl,
	prettyRatingString,
	SimpleGameType,
	simpleGameTypeToString
} from "../utils/utils";

const logger = createLayeredLogger(LoggerLayers.buildProfileEmbed);

const pullRatings = <I extends IDStrings = IDStrings>(
	ratings: Partial<Record<UGSRatingsLookup[I], number>>
): string[] => {
	const allRatings: string[] = [];
	const RatingKeys = <UGSRatingsLookup[I][]>Object.keys(ratings);

	RatingKeys.map((rating) => {
		const ratingValue: number = ratings[rating] || 0;
		allRatings.push(`${prettyRatingString(rating)}: ${Math.round((ratingValue + Number.EPSILON) * 100) / 100}`);
	});

	return allRatings;
};

export const fetchUserDetails = async (userId: number): Promise<PublicUserDocument> => {
	try {
		logger.info(`Fetching public user document for ${userId}`);
		const data = (await TachiServerV1Get<PublicUserDocument>(`/users/${userId}`))?.body;
		if (data) {
			return data;
		} else {
			throw new Error(`Could not find public user document for ${userId}`);
		}
	} catch (e) {
		logger.error("Unable to  fetch user details");
		throw new Error("Unable to  fetch user details");
	}
};

export const buildProfileEmbed = async (data: UserGameStats[], game?: SimpleGameType<Game>): Promise<MessageEmbed> => {
	try {
		logger.info(`Building profile embed${game ? `for ${formatGameWrapper(game)}` : ""}`);
		const embed = new MessageEmbed().setColor("#cc527a");

		const userId = data[0].userID;
		const userDetails = await fetchUserDetails(userId);
		const pfp = userDetails.customPfp
			? getPfpUrl(userId)
			: "https://cdn.mos.cms.futurecdn.net/mrArzwHcNuQbRwbEmuiwdJ.jpg";
		embed.setTitle(`${userDetails.username}'s Profile`);
		embed.setThumbnail(pfp);
		embed.setAuthor(`@${userDetails.username}`, pfp);

		logger.info(`Embed is for ${userDetails.username}`);

		if (game) {
			const specificData: UserGameStats | undefined = find(
				data,
				(item) => simpleGameTypeToString(game) === `${item.game}:${item.playtype}`
			);
			if (specificData) {
				embed.addField(
					`Stats for: ${formatGameWrapper(game)}`,
					`${pullRatings(specificData.ratings).join("\n")}`
				);
			} else {
				embed.addField("Select a game to see stats", `No stats for ${formatGameWrapper(game)}`);
			}
		} else {
			embed.addField("Select a game to see stats", "\u200B");
		}

		return embed;
	} catch (e) {
		logger.error(e);
		throw new Error("Unable to build profile embed");
	}
};

export const buildProfileIntractable = async (
	userId: string,
	game?: SimpleGameType<Game>
): Promise<InteractionReplyOptions | MessagePayload> => {
	try {
		const data = (await TachiServerV1Get<UserGameStats[]>(`/users/${userId}/game-stats`))?.body;
		logger.verbose(data);

		/** @TODO Verify we got valid data here! */
		if (data) {
			const dropdown = new MessageActionRow().addComponents(
				new MessageSelectMenu()
					.setCustomId(`SelectGameForProfile:${userId}`)
					.setPlaceholder("Browse By Game")
					.addOptions(
						data.map((_game) => {
							return {
								label: `${formatGameWrapper(_game)}`,
								value: `${_game.game}:${_game.playtype}`
							};
						})
					)
			);

			return { embeds: [await buildProfileEmbed(data, game)], components: [dropdown] };
		}

		throw new Error(`No data found for user ${userId}`);
	} catch (e) {
		logger.error("Unable to build profile interactable");
		throw new Error("Unable to build profile interactable");
	}
};
