import { CommandInteraction } from "discord.js";
import { Playtypes, PublicUserDocument, SongDocument } from "tachi-common";
import { ChartDocument, Game } from "tachi-common/js/types";
import { LoggerLayers } from "../../config";
import { TachiServerV1Get } from "../../utils/fetch-tachi";
import { createLayeredLogger } from "../../utils/logger";
import { stringToSimpleGameType } from "../../utils/utils";
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
	song: SongDocument;
	charts: ChartDocument[];
}

export const getSongMeta = async (
	songName: string,
	discordUserId: string
): Promise<SongSearchResult[]> => {
	try {
		logger.info(`Searching for ${songName}`);
		const songResponse = (
			await TachiServerV1Get<SearchResult>("/search", {
				search: songName,
			})
		).body?.songs;

		if (songResponse && songResponse.length > 0) {
			logger.info(`${songResponse.length} values found`);
			return songResponse;
		} else {
			logger.error(`No results found for ${songName}`);
			throw new Error(`No results found for ${songName}`);
		}
	} catch (e) {
		logger.error(e);
		throw new Error("Unable to fetch chart meta");
	}
};

export const getSongMetaFiltered = async (
	chartName: string,
	game: Game,
	discordUserId: string
): Promise<SongSearchResult[]> => {
	try {
		const songMeta = await getSongMeta(chartName, discordUserId);
		const songMetaFiltered = songMeta.filter((chart) => chart.game === game);
		if (songMetaFiltered.length === 0) {
			throw new Error("No songs found");
		}

		return songMetaFiltered;
	} catch (e) {
		logger.info(e);

		throw new Error("No songs found");
	}
};

export const getDetailedSongData = async <T extends Game>(
	songId: string,
	playtype: Playtypes[T],
	game: Game,
	discordUserId: string
): Promise<DetailedSongResponse> => {
	try {
		logger.info(`Getting detailed info for ${songId} (${game}:${playtype})`);
		const data = await TachiServerV1Get<DetailedSongResponse>(
			`/games/${game}/${playtype}/songs/${songId}`,
			{},
			{ discordId: discordUserId }
		);
		if (data.success) {
			return data.body;
		} else {
			logger.error(data.description);
			throw new Error(data.description);
		}
	} catch (e) {
		logger.info(e);
		throw new Error("Unable to fetch detailed song data");
	}
};

export const searchForSong = async (interaction: CommandInteraction): Promise<void> => {
	const songName = interaction.options.getString("song", true);
	const gpt = stringToSimpleGameType(interaction.options.getString("game", true));
	const game = gpt.game;
	const playtype = gpt.playtype;

	try {
		logger.info(`Requested ${songName} in ${game}`);

		const songMetaFiltered = await getSongMetaFiltered(songName, game, interaction.user.id);

		await interaction.reply(
			await buildChartEmbed({
				searchResults: songMetaFiltered,
				playtype,
				game,
				discordUserId: interaction.user.id,
			})
		);
	} catch (e) {
		await interaction.reply(`No results found for ${songName}`);
		logger.error(e);
	}
};
