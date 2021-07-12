import toast from "react-hot-toast";
import { SuccessfulAPIResponse, UnsuccessfulAPIResponse } from "tachi-common";

const BASE_OPTIONS = {
	credentials: "include",
};

// eslint-disable-next-line no-undef
const BASE_URL = process.env.REACT_APP_API_URL ?? "";

export function ToAPIURL(url: string) {
	if (url[0] !== "/") {
		// eslint-disable-next-line no-param-reassign
		url = `/${url}`;
	}

	return `${BASE_URL}/api/v1${url}`;
}

export async function APIFetchV1<T = unknown>(
	url: string,
	options: RequestInit = {},
	displaySuccess = false,
	displayFailure = false
): Promise<UnsuccessfulAPIResponse | SuccessfulAPIResponse<T>> {
	const mergedOptions = Object.assign({}, BASE_OPTIONS, options);

	try {
		const rj = await fetch(ToAPIURL(url), mergedOptions).then(r => r.json());

		if (!rj.success && displayFailure) {
			toast.error(rj.description, { duration: 10_000 });
		}

		if (displaySuccess) {
			toast.success(rj.description);
			// toast success
		}

		return rj;
	} catch (err) {
		console.error(err);
		throw err;
	}
}
