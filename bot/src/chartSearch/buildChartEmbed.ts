import { InteractionReplyOptions, MessageActionRow, MessageEmbed, MessagePayload, MessageSelectMenu } from "discord.js";
import { Game, IDStrings, Playtypes, PublicUserDocument, UGSRatingsLookup } from "tachi-common";
import { PBScoreDocument } from "tachi-common/js/types";
import { LoggerLayers } from "../config";
import { validSelectCustomIdPrefaces } from "../interactionHandlers/selectMenu/handleIsSelectMenu";
import { TachiServerV1Get } from "../utils/fetch-tachi";
import { createLayeredLogger } from "../utils/logger";
import { formatGameScoreRating, getGameImage } from "../utils/utils";
import { getDetailedSongData, SongSearchResult } from "./chartSearch";

const logger = createLayeredLogger(LoggerLayers.buildChartEmbed);

export interface PBResponse {
	users: PublicUserDocument[];
	pbs: PBScoreDocument[];
}

export const buildSongSelect = <T extends Game>(songs: SongSearchResult[], playtype: Playtypes[T], game: Game): MessageActionRow => {
	return new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId(validSelectCustomIdPrefaces.selectSongForSearch)
			.setPlaceholder("Select Song")
			.addOptions(
				songs.map((chart) => {
					return {
						label: `${chart.title} - ${chart.artist}`,
						value: `${chart.id}:${playtype}:${game}`
					};
				})
			)
	);
};

interface SimplePBDocument extends PBScoreDocument, Partial<PublicUserDocument> {}

export const getPBForChart = async <T extends Game>(
	chartId: string,
	playtype: Playtypes[T],
	game: Game
): Promise<SimplePBDocument> => {
	try {
		const data = await TachiServerV1Get<PBResponse>(`/games/${game}/${playtype}/charts/${chartId}/pbs`);
		if (data.success) {
			const pbs = data.body.pbs;
			const users = data.body.users;

			const topPb = pbs[0];
			const topUser = users.find((user) => user.id === topPb.userID);

			return {
				...topPb,
				...topUser
			};
		} else {
			logger.error(data.description);
			throw new Error(data.description);
		}
	} catch (e) {
		logger.error(e);

		throw new Error("Unable to fetch PBs for chart");
	}
};

export const buildChartEmbed = async <T extends Game, I extends IDStrings = IDStrings>(args: {
	searchResults?: SongSearchResult[];
	songId?: string;
	playtype: Playtypes[T];
	game: Game;
	/** @TODO Let users Toggle showing 2dExtra charts */
	IIDExtra?: boolean;
}): Promise<InteractionReplyOptions | MessagePayload> => {
	try {
		const { searchResults, songId, playtype, game, IIDExtra } = args;
		const embed = new MessageEmbed().setColor("#cc527a");

		if (!songId && searchResults) {
			embed.addField(`${searchResults.length} potential results found`, "Select from the dropdown");
			return { embeds: [embed], components: [buildSongSelect(searchResults, playtype, game)] };
		} else if (songId) {
			const details = await getDetailedSongData(songId, playtype, game);
			embed.addField(details.song.title || "Song", details.song.artist || "Artist");
			
			if ("firstVersion" in details.song.data) {
				embed.setThumbnail(getGameImage(details.song.data?.firstVersion, game));
			}

			const filteredCharts = details.charts.filter((chart) => {
				if (IIDExtra) {
					return true;
				} else {
					if (chart.data && !(chart.data as any)?.["2dxtraSet"]) {
						return true;
					}
				}

				return false;
			});

			const sortedCharts = filteredCharts.sort((a, b) => a.levelNum - b.levelNum);

			for (const chart of sortedCharts) {
				try {
					const PB = await getPBForChart(chart.chartID, chart.playtype, game);
					embed.addField(
						`${chart.difficulty} (${chart.level})`,
						`Server Top: **[${PB.username}](https://kamaitachi.xyz/dashboard/users/${
							PB.id
						}/games/${game}/${playtype})**\n${PB.scoreData.percent.toFixed(2)}% [${PB.scoreData.score}]\n${
							PB.scoreData.grade
						} [${PB.scoreData.lamp}]\n${Object.keys(PB.calculatedData)
							.map((item) => {
								return `${item}: ${formatGameScoreRating(
									{ game, playtype },
									<UGSRatingsLookup[I]>item,
									PB.calculatedData[item as never] || 0
								)}`;
							})
							.join("\n")}`,
						false
					);
				} catch {
					embed.addField(`${chart.difficulty} (${chart.level})`, "No Scores Available!");
				}
			}

			return { embeds: [embed] };
		} else {
			throw new Error("Invalid call to buildChartEmbed");
		}
	} catch (e) {
		logger.error(e);

		throw new Error("Error building chart embed");
	}
};
