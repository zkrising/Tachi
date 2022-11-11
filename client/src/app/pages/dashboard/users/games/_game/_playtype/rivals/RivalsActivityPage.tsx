import { ClumpActivity } from "util/activity";
import ApiError from "components/util/ApiError";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import React, { useState } from "react";
import { ActivityReturn } from "types/api-returns";
import { UGPT } from "types/react";
import UGPTActivity from "components/user/UGPTActivity";

export default function RivalsActivityPage({ reqUser, game, playtype }: UGPT) {
	const { data, error } = useApiQuery<ActivityReturn>(
		`/users/${reqUser.id}/games/${game}/${playtype}/rivals/activity`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	const joined = ClumpActivity(data);

	return <UGPTActivity data={joined} users={data.users} />;
}
