import { integer } from "tachi-common";

export function GetUSCIRReplayURL(scoreID: string) {
	return `/uscir/replays/${scoreID}`;
}

export function GetProfilePictureURL(userID: integer) {
	return `/users/pfp/${userID}`;
}

export function GetProfileBannerURL(userID: integer) {
	return `/users/banner/${userID}`;
}
