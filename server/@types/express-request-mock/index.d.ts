/* eslint-disable @typescript-eslint/no-explicit-any */
// this is a hack fix for express-request-mock's lack of typing.

declare module "express-request-mock" {
	import { Request, RequestHandler, Response } from "express";
	import { RequestOptions, MockResponse } from "node-mocks-http";

	export default function (
		callback: RequestHandler,
		options?: RequestOptions,
		decorators?: Record<string, unknown>
	): Promise<{
		req: Request;
		res: MockResponse<Response<any, Record<string, any>>>;
		request: Request;
		response: MockResponse<Response<any, Record<string, any>>>;
	}>;
}
