import React from "react";
import { PublicUserDocument, TachiAPIClientDocument } from "tachi-common";
import ApiError from "./ApiError";
import Loading from "./Loading";
import Muted from "./Muted";
import useApiQuery from "./query/useApiQuery";

export default function OAuthMoreInfo({
	client,
}: {
	client: Omit<TachiAPIClientDocument, "clientSecret">;
}) {
	const { data, isLoading, error } = useApiQuery<PublicUserDocument>(`/users/${client.author}`);

	if (error) {
		return <ApiError error={error} />;
	}

	if (isLoading || !data) {
		return <Loading />;
	}

	return <Muted>API Client Author: {data.username}.</Muted>;
}
