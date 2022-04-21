import deepmerge from "deepmerge";
import { Game, integer, Playtype } from "tachi-common";
import { FakeGameSettings, FakeOtherUser } from "./test-data";

/**
 * Async Generator To Array
 */
export async function agta(ag: AsyncIterable<unknown> | Iterable<unknown>) {
	const a = [];
	for await (const el of ag) {
		a.push(el);
	}

	return a;
}

/**
 * Deep-modify an object. This is a wrapper around deepmerge that returns proper types.
 */
export function dmf<T extends object>(base: T, modifant: Partial<T>): T {
	return deepmerge(base, modifant) as T;
}

/**
 * Make a fake user for testing. This automatically sets the username to something
 * unique (to avoid index collisions)
 *
 * @param userID - The userID this fake user should have.
 */
export function mkFakeUser(userID: integer) {
	return dmf(FakeOtherUser, {
		id: userID,
		username: `user${userID}`,
		usernameLowercase: `user${userID}`,
	});
}

export function mkFakeGameSettings(userID: integer, game: Game, playtype: Playtype) {
	return dmf(FakeGameSettings, {
		userID,
		game,
		playtype,
	});
}
