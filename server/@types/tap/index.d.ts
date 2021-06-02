/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "tap" {
    export function rejects(
        promiseOrFn: Promise<any> | ((...args: any[]) => Promise<any>),
        expectedError: any,
        message?: string,
        extra?: any
    ): Promise<void>;
}
