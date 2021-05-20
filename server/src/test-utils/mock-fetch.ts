import { Response } from "node-fetch";
import { NodeFetch } from "../fetch";

export function MockFetch(data: Partial<Response>) {
    // We know! this is a mock function.
    // eslint-disable-next-line require-await
    return ((async () => data) as unknown) as NodeFetch;
}
