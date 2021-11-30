import { integer } from "tachi-common";

export function GetUSCIRReplayURL(scoreID: string) {
	return `/uscir/replays/${scoreID}`;
}

export function GetProfilePictureURL(userID: integer, contentHash: string) {
	return `/users/${userID}/pfp-${contentHash}`;
}

export function GetProfileBannerURL(userID: integer, contentHash: string) {
	return `/users/${userID}/banner-${contentHash}`;
}
