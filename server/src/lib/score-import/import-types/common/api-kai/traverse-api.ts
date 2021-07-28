import { KtLogger } from "lib/logger/logger";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import nodeFetch from "utils/fetch";
import { VERSION_STR } from "lib/constants/version";
import { CONF_INFO } from "lib/setup/config";

/**
 * Traverses a Kai-like personal_bests api.
 * @param baseUrl The base URL to fetch requests from. - https://google.com
 * @param subUrl The endpoint for the scores - /api/v1/personal_bests
 * @param authDoc The users' authentication document.
 * @param fetch This is so `fetch` can be mocked with something
 * that wont make http requests during tests.
 */
export async function* TraverseKaiAPI(
	baseUrl: string,
	subUrl: string,
	token: string,
	logger: KtLogger,
	fetch = nodeFetch
) {
	let fetchMoreData = true;
	let url = `${baseUrl}${subUrl}`;

	while (fetchMoreData) {
		// Rough SSRF check - KAI-like apis could potentially get us to perform
		// SSRF. We check if the origin of the next request is exactly the
		// original, expected, base URL.
		const origin = new URL(url).origin;

		if (origin !== baseUrl) {
			logger.severe(`${baseUrl} attempted SSRF with url ${url}?`);

			throw new ScoreImportFatalError(500, `${baseUrl} returned invalid data.`);
		}

		let json;
		// wrap all this in a try catch just incase the fetch or the res
		// json call fails.
		try {
			// eslint-disable-next-line no-await-in-loop
			const res = await fetch(url, {
				headers: {
					Authorization: `Bearer ${token}`,
					"User-Agent": `${CONF_INFO.name}/${VERSION_STR}`,
				},
			});

			// eslint-disable-next-line no-await-in-loop
			json = await res.json();
		} catch (err) {
			logger.error(`Recieved invalid response from ${url}.`, { err });
			throw new ScoreImportFatalError(
				500,
				`Recieved invalid response from ${url}. Are they down?`
			);
		}

		if (json._links === null || typeof json._links !== "object") {
			logger.error(`Recieved invalid JSON from ${url}. Invalid _links.`, { body: json });

			throw new ScoreImportFatalError(
				500,
				`Recieved no _links prop from ${url}. This is not an error with ${CONF_INFO.name}.`
			);
		}

		if (typeof json._links._next === "string") {
			url = json._links._next;
		} else if (json._links._next === null) {
			// exit the loop after this, we're on the last page.
			fetchMoreData = false;
		} else {
			logger.error(`Recieved invalid response from ${url}. Invalid _links._next.`, {
				body: json,
			});

			throw new ScoreImportFatalError(500, `Recieved invalid _links._next prop from ${url}.`);
		}

		if (!Array.isArray(json._items)) {
			logger.error(`Recieved invalid response from ${url}. Invalid _items.`, {
				body: json,
			});

			throw new ScoreImportFatalError(500, `Recieved invalid _items from ${url}.`);
		}

		// yield everything out of the score array
		for (const score of json._items) {
			yield score as unknown;
		}
	}
}
