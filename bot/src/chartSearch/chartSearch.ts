import { CommandInteraction } from "discord.js";
import { Playtypes, PublicUserDocument, SongDocument } from "tachi-common";
import { ChartDocument, Game } from "tachi-common/js/types";
import { LoggerLayers } from "../config";
import { TachiServerV1Get } from "../utils/fetch-tachi";
import { createLayeredLogger } from "../utils/logger";
import { stringToSimpleGameType } from "../utils/utils";
import { buildChartEmbed } from "./buildChartEmbed";

const logger = createLayeredLogger(LoggerLayers.chartSearch);

export interface SongSearchResult extends SongDocument {
	game: Game;
	__textScore: number;
}

export interface SearchResult {
	users: PublicUserDocument[];
	songs: SongSearchResult[];
}

export interface DetailedSongResponse {
	song: Partial<SongDocument>;
	charts: ChartDocument[];
}

export const getChartMeta = async (chartName: string): Promise<SongSearchResult[]> => {
	try {
		logger.info(`Searching for ${chartName}`);
		const chartResponse = (
			await TachiServerV1Get<SearchResult>("/search", {
				search: chartName
			})
		).body?.songs;

		if (chartResponse && chartResponse.length > 0) {
			logger.info(`${chartResponse.length} values found`);
			return chartResponse;
		} else {
			logger.error(`No results found for ${chartName}`);
			throw new Error(`No results found for ${chartName}`);
		}
	} catch (e) {
		logger.error(e);
		throw new Error("Unable to fetch chart meta");
	}
};

export const getChartMetaFiltered = async (chartName: string, game: Game): Promise<SongSearchResult[]> => {
	try {
		const chartMeta = await getChartMeta(chartName);
		const chartMetaFiltered = chartMeta.filter((chart) => chart.game === game);
		if (chartMetaFiltered.length === 0) {
			logger.info("No charts found");

			throw new Error("No charts found");
		}

		return chartMetaFiltered;
	} catch (e) {
		logger.info(e);

		throw new Error("No charts found");
	}
};

export const getDetailedChartData = async <T extends Game>(
	chartId: string,
	playtype: Playtypes[T],
	game: Game
): Promise<DetailedSongResponse> => {
	try {
		logger.info(`Getting detailed info for ${chartId} (${game}:${playtype})`);
		const data = await TachiServerV1Get<DetailedSongResponse>(`/games/${game}/${playtype}/songs/${chartId}`);
		if (data.success) {
			return data.body;
		} else {
			logger.error(data.description);
			throw new Error(data.description);
		}
	} catch (e) {
		logger.info(e);
		throw new Error("Unable to fetch detailed chart data");
	}
};

export const searchForChart = async (interaction: CommandInteraction): Promise<void> => {
	const chartName = interaction.options.getString("chart", true);
	const gpt = stringToSimpleGameType(interaction.options.getString("game", true));
	const game = gpt.game;
	const playtype = gpt.playtype;

	try {
		logger.info(`Requested ${chartName} in ${game}`);

		const chartMetaFiltered = await getChartMetaFiltered(chartName, game);

		await interaction.reply(await buildChartEmbed({ searchResults: chartMetaFiltered, playtype, game }));
	} catch (e) {
		await interaction.reply(`No results found for ${chartName}`);
		logger.error(e);
	}
};
