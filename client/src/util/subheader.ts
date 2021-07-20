import { TachiConfig } from "lib/config";
import { SetState } from "types/react";

export function UpdateSubheader(
	breadcrumbs: string[],
	setTitle: SetState<string>,
	setBreadcrumbs: SetState<string[]>,
	customTitle?: string
) {
	const title = customTitle ?? breadcrumbs[breadcrumbs.length - 1];

	document.title = `${title} | ${TachiConfig.name}`;
	setTitle(title);
	setBreadcrumbs(breadcrumbs);
}
