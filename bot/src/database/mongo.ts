import { Snowflake } from "discord.js/typings/index.js";
// import monk from "monk";
import { integer } from "tachi-common";
// import { ProcessEnv } from "../setup";

// const monkDB = monk(ProcessEnv.MONGO_URL);

export interface DiscordUserMapDocument {
	userID: integer;
	discordID: Snowflake;
	tachiApiToken: string;
}

const db = {
	discordUserMap: (() => {
		console.error("DATABASE HAS BEEN STUBBED OUT TEMPORARILY. SIGTERMING.");
		process.exit(1);
	}) as any, // monkDB.get<DiscordUserMapDocument>("discordUserMap")
};

export default db;
