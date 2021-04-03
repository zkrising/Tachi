import nodeFetch, { Response } from "node-fetch";

export function mockFetch(data: Partial<Response>) {
    return ((async () => data) as unknown) as typeof nodeFetch;
}
