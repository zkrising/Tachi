/** @deprecated replace with database call & cache */
export const allowedChannels = [
	"876321394005254214"
];

export enum LoggerLayers  {
	client = "client",
	songLink = "songLink",
	embedGenerator = "embedGenerator"
}

export const platformRegex = [
	"open.spotify.com",
	"play.google.com/music/m",
	"music.apple.com",
	"soundcloud.com",
	"deezer.com",
	"^\\?(https?://)?(www.)?(youtube.com|youtu.?be)/.+$",
];

export const platformData: Record<string, {emoji: string, prettyName: string}> = {
	spotify: {
		emoji: "686481957730779146",
		prettyName: "Spotify",
	},
	soundcloud: {
		emoji: "686481619405766706",
		prettyName: "Soundcloud",
	},
	google: {
		emoji: "686482178464284674",
		prettyName: "Google Play",
	},
	appleMusic: {
		emoji: "686482030120140886",
		prettyName: "Apple Music",
	},
	youtube: {
		emoji: "689044959290196020",
		prettyName: "Youtube",
	},
	deezer: {
		emoji: "699195540180566026",
		prettyName: "Deezer",
	},
};
