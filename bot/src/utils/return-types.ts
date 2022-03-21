import { APIPermissions, Game, ImportTypes, integer } from "tachi-common";

export interface ServerConfig {
	games: Game[];
	importTypes: ImportTypes[];
	name: string;
	type: "ktchi" | "btchi" | "omni";
}

export interface ServerStatus {
	serverTime: number;
	startTime: number;
	version: string;
	whoami: integer | null;
	permissions: APIPermissions[];
}
