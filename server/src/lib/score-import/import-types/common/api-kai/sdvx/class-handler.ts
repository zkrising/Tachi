import { KaiTypeToBaseURL } from "../utils";
import { SDVXDans } from "lib/constants/classes";
import nodeFetch from "utils/fetch";
import { IsRecord } from "utils/misc";
import type { KaiAPIReauthFunction } from "../traverse-api";
import type { ClassHandler } from "lib/score-import/framework/user-game-stats/types";

export async function CreateKaiSDVXClassHandler(
	kaiType: "EAG" | "FLO" | "MIN",
	token: string,
	reauthFn: KaiAPIReauthFunction,
	fetch = nodeFetch
): Promise<ClassHandler> {
	let json: unknown;
	let err: unknown;
	const baseUrl = KaiTypeToBaseURL(kaiType);

	try {
		let res = await fetch(`${baseUrl}/api/sdvx/v1/player_profile`, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		// if we failed auth wise. Try reauthing.
		if (res.status === 401 || res.status === 403) {
			const newToken = await reauthFn();

			res = await fetch(`${baseUrl}/api/sdvx/v1/player_profile`, {
				headers: {
					Authorization: `Bearer ${newToken}`,
					"Content-Type": "application/json",
				},
			});
		}

		json = (await res.json()) as unknown;
	} catch (e: unknown) {
		err = e;
	}

	return (game, playtype, userID, ratings, logger) => {
		logger.info(`Got return from ${baseUrl}/api/sdvx/v1/player_profile.`, {
			json,
		});

		if (err !== undefined) {
			logger.error(`An error occured while updating classes for ${baseUrl}.`, { err });
			return {};
		}

		if (!IsRecord(json)) {
			logger.error(`JSON Returned from server was not an object? Not updating anything.`, {
				json,
			});
			return {};
		}

		if (
			json.skill_level === null ||
			json.skill_level === undefined ||
			typeof json.skill_level !== "number"
		) {
			logger.info(`User has no/invalid skill_level. Not updating anything.`, {
				skillLevel: json.skill_level,
			});
			return {};
		}

		const sdvxDan: number | null = json.skill_level - 1;

		if (!Number.isInteger(sdvxDan)) {
			logger.warn(`${baseUrl} returned a dan of ${sdvxDan}, which was not an integer.`);
			return {};
		}

		if (sdvxDan > SDVXDans.INF) {
			logger.warn(
				`${baseUrl} returned a dan of ${sdvxDan}, which was greater than INF (${SDVXDans.INF}.)`
			);
			return {};
		}

		// Kai APIs return -1 to indicate no dan. They also sometimes return undefined.
		// I'm not too sure why.
		if (sdvxDan === -1) {
			return {};
		}

		if (sdvxDan < SDVXDans.DAN_1) {
			logger.warn(
				`${baseUrl} returned a dan of ${sdvxDan}, which was less than DAN_1 (${SDVXDans.DAN_1}.)`
			);
			return {};
		}

		return {
			dan: sdvxDan,
		};
	};
}
