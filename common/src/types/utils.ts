/**
 * Given a type Array<T> or ReadonlyArray<T>, return T.
 */
export type ExtractArrayElementType<R> = R extends ReadonlyArray<infer V> ? V : never;
