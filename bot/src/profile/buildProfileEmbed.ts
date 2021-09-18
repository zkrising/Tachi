import { InteractionReplyOptions, MessageActionRow, MessageEmbed, MessagePayload, MessageSelectMenu } from "discord.js";
import { Game, UserGameStats } from "tachi-common";
import { IDStrings, UGSRatingsLookup } from "tachi-common/js/types";
import { find } from "lodash";
import { LoggerLayers } from "../config";
import { TachiServerV1Get } from "../utils/fetch-tachi";
import { createLayeredLogger } from "../utils/logger";
import { formatGameWrapper, prettyRatingString, SimpleGameType, simpleGameTypeToString } from "../utils/utils";

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

export const buildProfileEmbed = (data: UserGameStats[], game?: SimpleGameType<Game>): MessageEmbed => {
	const embed = new MessageEmbed().setColor("#cc527a");

	/** @TODO FETCH USERS ACTUAL DETAILS */
	embed.addField("Foo", "Foo");
	embed.addField("Bar", "Bar");
	embed.addField("Baz", "Baz");
	embed.setThumbnail("https://cdn.mos.cms.futurecdn.net/mrArzwHcNuQbRwbEmuiwdJ.jpg");

	if (game) {
		const specificData: UserGameStats | undefined = find(
			data,
			(item) => simpleGameTypeToString(game) === `${item.game}:${item.playtype}`
		);
		if (specificData) {
			embed.addField(`Stats for: ${formatGameWrapper(game)}`, `${pullRatings(specificData.ratings).join("\n")}`);
		} else {
			throw new Error(`Could not get ratings for requested game: ${game}`);
		}
	} else {
		embed.addField("Select a game to see stats", "\u200B");
	}

	return embed;
};

export const buildProfileIntractable = async (
	userId: string,
	game?: SimpleGameType<Game>
): Promise<InteractionReplyOptions | MessagePayload> => {
	try {
		const data = (await TachiServerV1Get<UserGameStats[]>(`/users/${userId}/game-stats`))?.body;
		logger.verbose(data);

		if (data) {
			const dropdown = new MessageActionRow().addComponents(
				new MessageSelectMenu()
					.setCustomId(`SelectGameForProfile:${userId}`)
					.setPlaceholder("Browse By Game")
					.addOptions(
						data.map((game) => {
							return {
								label: `${formatGameWrapper(game)}`,
								value: `${game.game}:${game.playtype}`
							};
						})
					)
			);

			return { embeds: [buildProfileEmbed(data, game)], components: [dropdown] };
		} else {
			throw new Error(`No data found for user ${userId}`);
		}
	} catch (e) {
		logger.error("Unable to build profile interactable");
		throw new Error("Unable to build profile interactable");
	}
};
