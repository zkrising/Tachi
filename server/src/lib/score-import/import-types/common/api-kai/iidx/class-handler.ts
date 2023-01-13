import { KaiTypeToBaseURL } from "../utils";
import { IIDX_DANS } from "tachi-common";
import { IIDXDans } from "tachi-common/config/game-support/iidx";
import nodeFetch from "utils/fetch";
import { IsRecord } from "utils/misc";
import type { KaiAPIReauthFunction } from "../traverse-api";
import type { ClassProvider } from "lib/score-import/framework/calculated-data/types";

export async function CreateKaiIIDXClassProvider(
	kaiType: "EAG" | "FLO",
	token: string,
	reauthFn: KaiAPIReauthFunction,
	fetch = nodeFetch
): Promise<ClassProvider> {
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

	return (gptString, userID, ratings, logger) => {
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

		if (gptString === "iidx:SP") {
			maybeIIDXDan = json.sp;
		} else if (gptString === "iidx:DP") {
			maybeIIDXDan = json.dp;
		} else {
			logger.warn(`KAIIIDXClassUpdater called with invalid gptString of ${gptString}.`);
			return {};
		}

		if (
			maybeIIDXDan === null ||
			maybeIIDXDan === undefined ||
			typeof maybeIIDXDan !== "number"
		) {
			logger.info(`User has no ${gptString} dan. Not updating anything.`);
			return {};
		}

		const iidxDan: number = maybeIIDXDan;

		if (!Number.isInteger(iidxDan)) {
			logger.warn(`${baseUrl} returned a dan of ${iidxDan}, which was not a number.`);
			return {};
		}

		if (iidxDan > IIDX_DANS.KAIDEN) {
			logger.warn(
				`${baseUrl} returned a dan of ${iidxDan}, which was greater than KAIDEN (${IIDX_DANS.KAIDEN}.)`
			);
			return {};
		}

		if (iidxDan < IIDX_DANS.KYU_7) {
			logger.warn(
				`${baseUrl} returned a dan of ${iidxDan}, which was less than KYU_7 (${IIDX_DANS.KYU_7}.)`
			);
			return {};
		}

		const value = IIDXDans[iidxDan];

		if (!value) {
			logger.warn(
				`${baseUrl} returned a dan of ${iidxDan}, which has no corresponding value.`
			);
			return {};
		}

		return {
			dan: value.id,
		};
	};
}
