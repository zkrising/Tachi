import { LoggerLayers } from "config";
import { BotConfig } from "setup";
import { integer, SuccessfulAPIResponse, UnsuccessfulAPIResponse } from "tachi-common";
import { createLayeredLogger } from "./logger";

const logger = createLayeredLogger(LoggerLayers.tachiFetch);

export type APIResponse<T> = (SuccessfulAPIResponse<T> | UnsuccessfulAPIResponse) & { statusCode: integer };

export enum RequestTypes {
	GET = "GET",
	POST = "POST",
	PATCH = "PATCH",
	PUT = "PUT",
	DELETE = "DELETE",
	// HEAD, OPTIONS not used by tachi-server anywhere.
}

/**
 * Performs a request against the Tachi server.
 *
 * @param method - What HTTP method to use. This does not support GET requests - for that, @see TachiServerGet
 * @param url - The URL to perform this against.
 * @param body - Optionally, provide some content for the request body.
 * @param T - A generic that asserts the type of the response contents. Defaults to unknown.
 */
export async function TachiServerV1Request<T>(method: Exclude<RequestTypes, RequestTypes.GET>, url: string, body: unknown = {}): Promise<APIResponse<T>> {
	const realUrl = PrependTachiUrl(url, "1");
	const loggerUrl = `${method} ${realUrl}`;

	logger.debug(`Making a request to ${loggerUrl}.`);
	
	try {
		const res = await fetch(realUrl, {
			method,
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(body)
		});

		const json = await res.json();
		const contents = { ...json, statusCode: res.status };

		LogRequestResult(loggerUrl, contents);

		return contents;
	} catch (err) {
		logger.error(`Failed while requesting ${method} ${realUrl}.`, { err });
		
		// Throw the error upwards for it to be caught be a higher handler.
		throw err;
	}
}

/**
 * Performs a GET request against the Tachi server.
 *
 * @param url - The URL to request.
 * @param params - Any URL params for this request.
 * @param T - A generic that asserts the type of the response contents. Defaults to unknown.
 */
export async function TachiServerV1Get<T = unknown>(url: string, params: Record<string, string> = {}): Promise<APIResponse<T>> {
	try {
		const urlParams = new URLSearchParams(params);

		const realUrl = `${PrependTachiUrl(url, "1")}?${urlParams.toString()}`;
	
		const res = await fetch(realUrl);
		const json = await res.json();
		const contents = { ...json, statusCode: res.status };

		LogRequestResult(`GET ${realUrl}`, contents);

		return contents;
	} catch (err) {
		logger.error(`Failed while requesting GET ${url}.`, { err });
		
		throw err;
	}
}

/**
 * Takes a url like "/hello" or "bar" and converts it to "https://tachi-server.com/api/v1/hello" or "https://tachi-server.com/api/v1/bar".
 */
export function PrependTachiUrl(url: string, version: "1" = "1"): string {
	if (url[0] !== "/") {
		url = "/" + url;
	}

	return `${BotConfig.TACHI_SERVER_LOCATION}/api/v${version}${url}`;
}

/**
 * Logs the result of a request.
 * Logs at WARN level if was unsuccessful, DEBUG otherwise.
 */
function LogRequestResult(loggerUrl: string, res: APIResponse<unknown>): void {
	if (!res.success) {
		logger.warn(`Request ${loggerUrl} was unsuccessful: ${res.description} (${res.statusCode})`);
	} else {
		logger.debug(`Request ${loggerUrl} was successful: ${res.description} (${res.statusCode})`);
	}
}