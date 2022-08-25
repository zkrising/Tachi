import Loading from "components/util/Loading";
import React, { CSSProperties } from "react";
import { UnsuccessfulAPIResponse } from "tachi-common";

export default function LoadingWrapper({
	dataset,
	error,
	children,
	style,
}: {
	dataset: unknown | null | undefined;
	error: UnsuccessfulAPIResponse | null;
	children: JSX.Element | JSX.Element[];
	style?: CSSProperties;
}) {
	if (error) {
		return <h3>An error has occured. {error.description}</h3>;
	}

	if (!dataset) {
		return <Loading style={style} />;
	}

	return <>{children}</>;
}
