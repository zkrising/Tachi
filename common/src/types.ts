/**
 * An alias for number, that makes part of the code self-documenting.
 * Note that if it were possible to enforce integer-y ness, then I would absolutely do so here
 * but I can not.
 */
export type integer = number;

export enum UserAuthLevels {
	BANNED = 0,
	USER = 1,
	MOD = 2,
	ADMIN = 3,
}

// export * from "./types/api";
// export * from "./types/batch-manual";
// export * from "./types/documents";
// export * from "./types/game-implementations";
// export * from "./types/import-types";
// export * from "./types/notifications";
