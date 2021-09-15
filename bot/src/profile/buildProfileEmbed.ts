import { InteractionReplyOptions, MessageActionRow, MessageEmbed, MessagePayload, MessageSelectMenu } from "discord.js";
import { FormatGame, Game, Playtypes, UserGameStats } from "tachi-common";
import { IDStrings, UGSRatingsLookup } from "tachi-common/js/types";
import { find } from "lodash";

export const buildProfileEmbed = (data: UserGameStats[], game?: string): MessageEmbed => {
	const embed = new MessageEmbed().setColor("#cc527a");

	/** @TODO FETCH USERS ACTUAL DETAILS */
	embed.addField("Foo", "Foo");
	embed.addField("Bar", "Bar");
	embed.addField("Baz", "Baz");
	embed.setThumbnail("https://cdn.mos.cms.futurecdn.net/mrArzwHcNuQbRwbEmuiwdJ.jpg");

	if (game) {
		const specificData: UserGameStats | undefined = find(data, (item) => game === `${item.game}:${item.playtype}`);
		if (!specificData) {
			throw new Error(`Could not get ratings for requested game: ${game}`);
		} else {
			const ratings: string[] = [];
			Object.keys(specificData.ratings).map((rating) => {
				/** @TODO MAKE THIS ITS OWN FUNCTION THIS IS FILTHY */
				ratings.push(
					`${rating}: ${
						Math.round(
							(specificData.ratings[rating as UGSRatingsLookup[IDStrings]] || 0 + Number.EPSILON) * 100
						) / 100
					}`
				);
			});

			/** @TODO DONT SPLIT THE STRING HERE HOLY SHIT */
			embed.addField(
				`Stats for: ${FormatGame(game.split(":")[0] as Game, game.split(":")[1] as Playtypes[never])}`,
				`${ratings.join("\n")}`
			);
		}
	} else {
		embed.addField("Select a game to see stats", "\u200B");
	}

	return embed;
};

export const buildProfileIntractable = (
	data: UserGameStats[],
	userId: string,
	game?: string
): InteractionReplyOptions | MessagePayload => {
	const dropdown = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId(`SelectGameForProfile:${userId}`)
			.setPlaceholder("Browse By Game")
			.addOptions(
				data.map((game) => {
					return {
						label: `${FormatGame(game.game, game.playtype)}`,
						value: `${game.game}:${game.playtype}`
					};
				})
			)
	);

	return { embeds: [buildProfileEmbed(data, game)], components: [dropdown] };
};
