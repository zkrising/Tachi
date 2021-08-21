import { getLinks } from "songlink-api";
import * as deezerApi from "deezer-api-ts";
import { SonglinkPlatform } from "songlink-api/lib/types/Platform";
import { SonglinkResponse } from "songlink-api/lib/types/Response";
import { LoggerLayers } from "../config";
import { createLayeredLogger } from "../utils/logger";

const logger = createLayeredLogger(LoggerLayers.songLink);

interface MetaData {
	title?: string;
	artistName?: string;
	artwork?: string;
	genres?: string[]
	releaseYear?: string;
}

export interface SongLinkDataLinks {
	entityUniqueId: string;
	url: string;
	nativeAppUriMobile?: string;
	nativeAppUriDesktop?: string;
}

export interface SongLinkData {
	links: {
		[P in SonglinkPlatform]: SongLinkDataLinks
	}
	moreUrl: string;
	metaData: MetaData;
}

export const getIdFromEntity = (entity: string): string => {
	try {
		return entity.split("::")[1];
	} catch (e) {
		logger.error("Unable to getIdFromEntity:", e);
	}
};

export const getDetailedMetadata = async (data: SonglinkResponse): Promise<MetaData> => {
	if (data.linksByPlatform.deezer) {
		try {
			logger.info("Fetching metadata from Deezer");

			const entityId = getIdFromEntity(data.linksByPlatform.deezer.entityUniqueId);

			let metaData;
			if (data.linksByPlatform.deezer.entityUniqueId.includes("SONG")) {
				const songMetaData = await deezerApi.getTrack(parseInt(entityId));
				metaData = {
					title: songMetaData.title,
					artist: songMetaData.artist,
					artwork: songMetaData.album?.cover || ""
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
	} else {
		logger.warn("Requested metaData but it is not on any supported streaming services");
	}
};

export const getSongLinkResponse = async (url: string): Promise<SongLinkData> => {
	logger.info("Fetching songLink");

	try {
		const rawData = await getLinks({ url: url }, { apiKey: process.env.SONGLINKAPIKEY });

		const firstEntity = rawData.entitiesByUniqueId[Object.keys(rawData.entitiesByUniqueId)[0]];
		const basicMetadata: MetaData = {
			title: firstEntity.title,
			artistName: firstEntity.artistName,
			artwork: firstEntity.thumbnailUrl
		};

		const detailedMetadata = await getDetailedMetadata(rawData);

		return {
			links: rawData.linksByPlatform,
			moreUrl: rawData.pageUrl,
			metaData: {
				title: detailedMetadata?.title || basicMetadata.title,
				artistName: detailedMetadata?.artistName || basicMetadata.artistName,
				artwork: detailedMetadata?.artwork || basicMetadata.artwork,
				genres: detailedMetadata?.genres,
				releaseYear: detailedMetadata?.releaseYear
			}
		};
	} catch (e) {
		logger.error("Unable to fetch songLink response:", e);
	}
};

