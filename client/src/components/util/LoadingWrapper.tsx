import React, { CSSProperties } from "react";
import Loading from "components/util/Loading";
import { UnsuccessfulAPIResponse } from "tachi-common";

export default function LoadingWrapper({
	dataset,
	isLoading,
	error,
	children,
	style,
}: {
	dataset: unknown | null | undefined;
	isLoading: boolean;
	error: UnsuccessfulAPIResponse | null;
	children: JSX.Element | JSX.Element[];
	style?: CSSProperties;
}) {
	if (error) {
		return <h3>An error has occured. {error.description}</h3>;
	}

	if (isLoading || !dataset) {
		return <Loading style={style} />;
	}

	return <>{children}</>;
}
