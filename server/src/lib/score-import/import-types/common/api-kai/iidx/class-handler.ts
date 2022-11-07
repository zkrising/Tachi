import { KaiTypeToBaseURL } from "../utils";
import { IIDXDans } from "lib/constants/classes";
import nodeFetch from "utils/fetch";
import { IsRecord } from "utils/misc";
import type { KaiAPIReauthFunction } from "../traverse-api";
import type { ClassHandler } from "lib/score-import/framework/user-game-stats/types";

export async function CreateKaiIIDXClassHandler(
	kaiType: "EAG" | "FLO",
	token: string,
	reauthFn: KaiAPIReauthFunction,
	fetch = nodeFetch
): Promise<ClassHandler> {
	let json: unknown;
	let err: unknown;
	const baseUrl = KaiTypeToBaseURL(kaiType);

	// SP and DP dans are located in the same place,
	// fetch once, then return a function that traverses this data.
	try {
		let res = await fetch(`${baseUrl}/api/iidx/v2/player_profile`, {
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

		if (res.status !== 200) {
			const text = await res.text();

			throw new Error(`Got unexpected status from ${kaiType}: ${res.status}. Body: ${text}`);
		}

		json = (await res.json()) as unknown;
	} catch (e: unknown) {
		err = e;
	}

	return (game, playtype, userID, ratings, logger) => {
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

		let maybeIIDXDan: unknown;

		if (playtype === "SP") {
			maybeIIDXDan = json.sp;
		} else if (playtype === "DP") {
			maybeIIDXDan = json.dp;
		} else {
			logger.warn(`KAIIIDXClassUpdater called with invalid playtype of ${playtype}.`);
			return {};
		}

		if (
			maybeIIDXDan === null ||
			maybeIIDXDan === undefined ||
			typeof maybeIIDXDan !== "number"
		) {
			logger.info(`User has no ${playtype} dan. Not updating anything.`);
			return {};
		}

		const iidxDan: number = maybeIIDXDan;

		if (!Number.isInteger(iidxDan)) {
			logger.warn(`${baseUrl} returned a dan of ${iidxDan}, which was not a number.`);
			return {};
		}

		if (iidxDan > IIDXDans.KAIDEN) {
			logger.warn(
				`${baseUrl} returned a dan of ${iidxDan}, which was greater than KAIDEN (${IIDXDans.KAIDEN}.)`
			);
			return {};
		}

		if (iidxDan < IIDXDans.KYU_7) {
			logger.warn(
				`${baseUrl} returned a dan of ${iidxDan}, which was less than KYU_7 (${IIDXDans.KYU_7}.)`
			);
			return {};
		}

		return {
			dan: iidxDan,
		};
	};
}
