import { APIFetchV1, UnsuccessfulAPIFetchResponse } from "util/api";
import { useQuery } from "react-query";
import { SuccessfulAPIResponse } from "tachi-common";

export default function useApiQuery<T>(
	url: string | string[],
	options?: RequestInit,
	additionalDeps?: string[],
	skip = false
) {
	const deps = [];

	if (additionalDeps) {
		deps.push(...additionalDeps);
	}

	if (Array.isArray(url)) {
		deps.push(...url);
	} else {
		deps.push(url);
	}

	return useQuery<T, UnsuccessfulAPIFetchResponse>(
		deps,
		async () => {
			if (skip) {
				throw new Error("Skipped");
			}

			if (Array.isArray(url)) {
				const results = await Promise.all(url.map((u) => APIFetchV1(u, options)));

				if (!results.every((r) => r.success)) {
					throw results;
				}

				return results.map((e) => (e as SuccessfulAPIResponse).body) as unknown as T;
			}

			const res = await APIFetchV1<T>(url, options);

			if (!res.success) {
				console.log(`Threw res`, res);
				throw res;
			}

			return res.body;
		},
		{
			retry: false,
		}
	);
}
