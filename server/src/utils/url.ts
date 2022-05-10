import { URL } from "url";

export function CreateURLWithParams(url: string, params: Record<string, string>) {
	const u = new URL(url);

	for (const [key, value] of Object.entries(params)) {
		u.searchParams.set(key, value);
	}

	return u;
}
