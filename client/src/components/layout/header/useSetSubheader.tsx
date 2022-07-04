import { UpdateSubheader } from "util/subheader";
import useSplashText from "components/util/useSplashText";
import { SubheaderContext } from "context/SubheaderContext";
import { useContext, useEffect } from "react";

export default function useSetSubheader(
	content: string[] | string,
	// eslint-disable-next-line default-param-last
	deps: unknown[] = [],
	overrideTitle?: string
) {
	const { setTitle, setBreadcrumbs } = useContext(SubheaderContext);

	const splash = useSplashText();

	useEffect(() => {
		UpdateSubheader(
			Array.isArray(content) ? content : [content],
			setTitle,
			setBreadcrumbs,
			splash,
			overrideTitle
		);
	}, deps);
}
