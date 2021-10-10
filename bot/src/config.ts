/** @TODO Potentially re-work this to only run on PROD env, handy for DEV env! **/
export const allowedChannels = ["876321394005254214"];

export enum LoggerLayers {
	client = "client",
	slashCommands = "slashCommands",
	server = "server",
	serverAuth = "serverAuth",
	botConfigSetup = "botConfigSetup",
	tachiFetch = "tachiFetch",
	profile = "profile",
	selectInteractionHandler = "selectInteractionHandler",
	buildProfileEmbed = "buildProfileEmbed",
	chartSearch = "chartSearch",
	buildChartEmbed = "buildChartEmbed",
	tachiLinker = "tachiLinker"
}
