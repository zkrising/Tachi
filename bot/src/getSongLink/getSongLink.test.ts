import { SonglinkResponse } from "songlink-api/lib/types/Response";
import {getDetailedMetadata, getIdFromEntity} from "./getSongLink";

interface MockSonglinkResponse extends Omit<Omit<SonglinkResponse, "linksByPlatform">, "entitiesByUniqueId"> {
	linksByPlatform: {
		deezer?: {
			entityUniqueId: string;
			url: string;
		};
		appleMusic?: {
			entityUniqueId: string;
			url: string;
		};
	}
}

describe("getIdFromEntity", () => {
	test("Should return a valid entity id", () => {
		expect(getIdFromEntity("DEEZER::uniqueSnowflake")).toEqual("uniqueSnowflake");
	});
});

const mockSongData: MockSonglinkResponse = {
	entityUniqueId: "DEEZER_SONG::17128360",
	userCountry: "",
	pageUrl: "",
	linksByPlatform: {
		"deezer": {
			entityUniqueId: "DEEZER_SONG::17128360",
			url: "",
		}
	}
};

const mockAlbumData: MockSonglinkResponse = {
	entityUniqueId: "DEEZER_ALBUM::1602407",
	userCountry: "",
	pageUrl: "",
	linksByPlatform: {
		"deezer": {
			entityUniqueId: "DEEZER_ALBUM::1602407",
			url: "",
		}
	}
};

const nonDeezerMockAlbumData: MockSonglinkResponse = {
	entityUniqueId: "ITUNES_ALBUM::1150202719",
	userCountry: "",
	pageUrl: "",
	linksByPlatform: {
		"appleMusic": {
			entityUniqueId: "ITUNES_ALBUM::1150202719",
			url: "",
		}
	}
};

const nonDeezerMockSongData: MockSonglinkResponse = {
	entityUniqueId: "ITUNES_SONG::1150202854",
	userCountry: "",
	pageUrl: "",
	linksByPlatform: {
		"appleMusic": {
			entityUniqueId: "ITUNES_SONG::1150202854",
			url: "",
		}
	}
};


describe("getDetailedMetadata", () => {
	test("Should fetch detailed metadata for a song", async () => {
		expect(await getDetailedMetadata(mockSongData as SonglinkResponse))
			.toHaveProperty("releaseYear", "2005-09-06");
	});
	test("Should fetch detailed metadata for an album", async () => {
		expect(await getDetailedMetadata(mockAlbumData as SonglinkResponse))
			.toHaveProperty("releaseYear", "2005-09-06");
	});
	test("Should fail nicely when fetching a non-deezer album", async () => {
		expect(await getDetailedMetadata(nonDeezerMockAlbumData as SonglinkResponse))
			.toEqual(undefined);
	});
	test("Should fail nicely when fetching a non-deezer song", async () => {
		expect(await getDetailedMetadata(nonDeezerMockSongData as SonglinkResponse))
			.toEqual(undefined);
	});
});
