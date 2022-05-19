// We know! these are mock functions.
/* eslint-disable require-await */
import type { Response } from "node-fetch";
import type { NodeFetch } from "utils/fetch";

/**
 * Creates a basic Fetch function used for statusCode checks.
 */
export function MockBasicFetch(data: Partial<Response>) {
	return (() => data) as unknown as NodeFetch;
}

/**
 * Creates a fake "fetch" function which takes a url and returns
 * a fake JSON -> data function at that key.
 */
export function MockJSONFetch(urlDataMap: Record<string, unknown>) {
	return ((url: string) =>
		new Promise((resolve, reject) => {
			if (url in urlDataMap) {
				const fakeResponse = {
					status: 200,
					json: () => Promise.resolve(urlDataMap[url]),
				} as unknown as Response;

				resolve(fakeResponse);
				return;
			}

			reject(
				new Error(
					`Unexpected url ${url} - No Data Present? Valid urls are ${Object.keys(
						urlDataMap
					).join(", ")}`
				)
			);
		})) as NodeFetch;
}
