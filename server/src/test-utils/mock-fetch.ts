// We know! these are mock functions.
/* eslint-disable require-await */
import { Response } from "node-fetch";
import { NodeFetch } from "utils/fetch";

/**
 * Creates a basic Fetch function used for statusCode checks.
 */
export function MockBasicFetch(data: Partial<Response>) {
	return (async () => data) as unknown as NodeFetch;
}

/**
 * Creates a fake "fetch" function which takes a url and returns
 * a fake JSON -> data function at that key.
 */
export function MockJSONFetch(urlDataMap: Record<string, unknown>) {
	return (async (url: string) => {
		if (urlDataMap[url]) {
			return {
				json: async () => urlDataMap[url],
			};
		}

		throw new Error(`Unexpected url ${url} - No Data Present?`);
	}) as NodeFetch;
}
