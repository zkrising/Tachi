import toast from "react-hot-toast";
import { SuccessfulAPIResponse, UnsuccessfulAPIResponse } from "tachi-common";
import { HumaniseError } from "./humanise-error";
import { SendErrorToast, SendSuccessToast } from "./toaster";

const BASE_OPTIONS = {
	credentials: "include",
};

// eslint-disable-next-line no-undef
const BASE_URL = process.env.REACT_APP_SERVER_URL ?? "";
const CDN_URL = process.env.REACT_APP_CDN_URL;

if (!CDN_URL) {
	throw new Error(`Cannot run -- no REACT_APP_CDN_URL provided?`);
}

export function ToAPIURL(url: string) {
	if (url[0] !== "/") {
		// eslint-disable-next-line no-param-reassign
		url = `/${url}`;
	}

	return `${BASE_URL}/api/v1${url}`;
}

export function ToCDNURL(url: string) {
	if (url[0] !== "/") {
		url = `/${url}`;
	}

	return `${CDN_URL}${url}`;
}

export function ToServerURL(url: string) {
	if (url[0] !== "/") {
		// eslint-disable-next-line no-param-reassign
		url = `/${url}`;
	}

	return `${BASE_URL}${url}`;
}

export type APIFetchV1Return<T> = (UnsuccessfulAPIResponse | SuccessfulAPIResponse<T>) & {
	statusCode: number;
};

export type UnsuccessfulAPIFetchResponse = UnsuccessfulAPIResponse & { statusCode: number };

export async function APIFetchV1<T = unknown>(
	url: string,
	options: RequestInit = {},
	displaySuccess = false,
	displayFailure = false
): Promise<APIFetchV1Return<T>> {
	const mergedOptions = Object.assign({}, BASE_OPTIONS, options);

	try {
		const res = await fetch(ToAPIURL(url), mergedOptions);

		const rj = await res.json();

		if (!rj.success) {
			console.warn(rj);
		} else {
			console.debug(rj.description);
		}

		if (!rj.success && displayFailure) {
			// probably a prudence error...
			if (rj.description.includes("[K:")) {
				SendErrorToast(HumaniseError(rj.description));
			} else {
				SendErrorToast(rj.description);
			}
		}

		if (displaySuccess && rj.success) {
			SendSuccessToast(rj.description);
			// toast success
		}

		return { ...rj, statusCode: res.status };
	} catch (err) {
		console.error(err);
		throw err;
	}
}
