// can't augment global scope without being a module.
// this is a no-op that indicates this file is a module.
export {};

/**
 * https://github.com/aws/aws-sdk-js-v3/issues/3063
 *
 * AWS-SDK depends on DOM types, because of course it does.
 *
 * We don't want to bring in the DOM for this, because server code obviously
 * never gets executed in the DOM.
 */
declare global {
	type ReadableStream = unknown;
}
