import nodeFetch, { Response } from "node-fetch";

export function MockFetch(data: Partial<Response>) {
    // We know! this is a mock function.
    // eslint-disable-next-line require-await
    return ((async () => data) as unknown) as typeof nodeFetch;
}
