import * as deezerApi from "deezer-api-ts";
import { SonglinkResponse } from "songlink-api/lib/types/Response";
import { LoggerLayers } from "../../config";
import { createLayeredLogger } from "../../utils/logger";
import { getIdFromEntity, MetaData } from "../getSongLink";

const logger = createLayeredLogger(LoggerLayers.deezerMetadata);

export const getDeezerMetadata = async (data: SonglinkResponse): Promise<MetaData> => {
	try {
		logger.info("Fetching metadata from Deezer");

		const entityId = getIdFromEntity(data.linksByPlatform.deezer.entityUniqueId);

		let metaData;
		if (data.linksByPlatform.deezer.entityUniqueId.includes("SONG")) {
			const songMetaData = await deezerApi.getTrack(parseInt(entityId));
			let albumMetadata;
			if (songMetaData.album.id) {
				albumMetadata = await deezerApi.getAlbum(songMetaData.album.id);
			}

			metaData = {
				title: songMetaData.title,
				artist: songMetaData.artist,
				artwork: songMetaData.album?.cover || "",
				genres: albumMetadata?.genres || undefined,
				release_date: albumMetadata?.release_date || undefined
			};
		} else {
			metaData = await deezerApi.getAlbum(parseInt(entityId));
		}


		if (!metaData.title) {
			logger.warn("Attempted to fetch metadata from deezer but received empty response");
			return;
		}

		logger.info(`Successfully fetched metadata for ${metaData.title}`);

		return {
			title: metaData.title,
			artistName: metaData.artist.name,
			artwork: metaData.cover,
			genres: metaData.genres?.data.map(genre => genre.name),
			releaseYear: metaData.release_date
		};
	} catch (e) {
		logger.error("Unable to fetch metadata from Deezer:", e);
	}
};
