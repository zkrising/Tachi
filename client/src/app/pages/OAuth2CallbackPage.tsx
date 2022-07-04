import ApiError from "components/util/ApiError";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import React from "react";
import { Link } from "react-router-dom";
import { ErrorPage } from "./ErrorPage";

export default function OAuth2CallbackPage({
	counterWeight,
	serviceName,
}: {
	counterWeight: string;
	serviceName: string;
}) {
	const query = new URLSearchParams(window.location.search);

	const code = query.get("code");

	if (!code) {
		return <ErrorPage statusCode={400} />;
	}

	const { data, isLoading, error } = useApiQuery(counterWeight, {
		method: "POST",
		body: JSON.stringify({ code }),
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (error) {
		<ApiError error={error} />;
	}

	if (isLoading || !data) {
		return (
			<div>
				We're checking up with this site to get your authentication sorted.
				<Loading />
			</div>
		);
	}

	return (
		<div>
			Authentication complete! You can now import with {serviceName}.
			<br />
			<Link to="/">Go home.</Link>
		</div>
	);
}
