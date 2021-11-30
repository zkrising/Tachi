export function CreateURLWithParams(url: string, params: Record<string, string>) {
	const u = new URL(url);

	for (const key in params) {
		u.searchParams.set(key, params[key]);
	}

	return u;
}
