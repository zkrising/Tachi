import React from "react";
import { UnsuccessfulAPIFetchResponse } from "util/api";

export default function ApiError({ error }: { error: UnsuccessfulAPIFetchResponse }) {
	return <div>An error has occured: {error.description}</div>;
}
