import { useQuery } from "react-query";
import { SuccessfulAPIResponse } from "tachi-common";
import { APIFetchV1, UnsuccessfulAPIFetchResponse } from "util/api";

export default function useApiQuery<T>(
	url: string | string[],
	options?: RequestInit,
	neverCache = false
) {
	return useQuery<T, UnsuccessfulAPIFetchResponse>(
		url,
		async () => {
			if (Array.isArray(url)) {
				const results = await Promise.all(url.map(u => APIFetchV1(u, options)));

				if (!results.every(r => r.success)) {
					throw results;
				}

				return (results.map(e => (e as SuccessfulAPIResponse).body) as unknown) as T;
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
