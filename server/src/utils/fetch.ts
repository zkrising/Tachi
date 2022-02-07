import { Environment } from "lib/setup/config";
import nodeFetch, { RequestInfo, RequestInit, Response } from "node-fetch";

const fetch =
	Environment.nodeEnv === "test"
		? () => {
				throw new Error("Cannot use real fetch inside testing env!");
		  }
		: nodeFetch;

export type NodeFetch = (url: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

export default fetch as unknown as NodeFetch;
