import Loading from "components/util/Loading";
import React from "react";
import { UnsuccessfulAPIResponse } from "tachi-common";

export default function LoadingWrapper({
	dataset,
	isLoading,
	error,
	children,
}: {
	dataset: unknown[] | null | undefined;
	isLoading: boolean;
	error: UnsuccessfulAPIResponse | null;
	children: JSX.Element | JSX.Element[];
}) {
	if (isLoading || !dataset) {
		return <Loading />;
	}

	if (error) {
		return <h3>An error has occured. {error.description}</h3>;
	}

	return <>{children}</>;
}
