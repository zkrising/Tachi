import { EscapeStringRegexp } from "./misc";

export function DoesMatchRoute(str: string, route: string) {
	const comps = EscapeStringRegexp(route).split("/");

	let regexStr = "";
	for (const comp of comps) {
		if (comp.startsWith(":")) {
			regexStr += "[^/]*/";
		} else {
			regexStr += `${comp}/`;
		}
	}

	regexStr += "?$";

	const regex = new RegExp(regexStr, "u");
	return !!str.match(regex);
}
