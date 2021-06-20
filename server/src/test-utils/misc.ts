/**
 * Async Generator To Array
 */
export async function agta(ag: AsyncIterable<unknown> | Iterable<unknown>) {
	const a = [];
	for await (const el of ag) {
		a.push(el);
	}

	return a;
}
