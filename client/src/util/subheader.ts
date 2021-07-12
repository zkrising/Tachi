import { SetState } from "types/react";

export function UpdateSubheader(
	breadcrumbs: string[],
	setTitle: SetState<string>,
	setBreadcrumbs: SetState<string[]>
) {
	const title = breadcrumbs[breadcrumbs.length - 1];

	document.title = `${title} | Kamaitachi`;
	setTitle(title);
	setBreadcrumbs(breadcrumbs);
}
