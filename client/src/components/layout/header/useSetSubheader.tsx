import { SubheaderContext } from "context/SubheaderContext";
import { useContext, useEffect } from "react";
import { UpdateSubheader } from "util/subheader";

export default function useSetSubheader(
	content: string[] | string,
	// eslint-disable-next-line default-param-last
	deps: unknown[] = [],
	overrideTitle?: string
) {
	const { setTitle, setBreadcrumbs } = useContext(SubheaderContext);

	useEffect(() => {
		UpdateSubheader(
			Array.isArray(content) ? content : [content],
			setTitle,
			setBreadcrumbs,
			overrideTitle
		);
	}, deps);
}
