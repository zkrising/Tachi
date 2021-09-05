/** @TODO Potentially re-work this to only run on PROD env, handy for DEV env! **/
/** @deprecated replace with database call & cache */
export const allowedChannels = [
	"876321394005254214"
];

export enum LoggerLayers  {
	client = "client",
	slashCommands = "slashCommands"
}
