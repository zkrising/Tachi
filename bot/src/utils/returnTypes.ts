import { APIPermissions, Game, ImportDocument, ImportTypes, integer } from "tachi-common";

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

export interface ImportDeferred {
	url: string;
	importID: string;
}

export type ImportPollStatus =
	| {
			importStatus: "completed";
			import: ImportDocument;
	  }
	| {
			importStatus: "ongoing";
			progress: {
				description: string;
				value: integer;
			};
	  };
