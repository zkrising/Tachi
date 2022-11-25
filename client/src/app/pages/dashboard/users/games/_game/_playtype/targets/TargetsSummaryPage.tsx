import ApiError from "components/util/ApiError";
import DebugContent from "components/util/DebugContent";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import React from "react";
import { RecentlyAchievedOrRaisedTargets } from "types/api-returns";
import { UGPT } from "types/react";

export default function TargetsSummaryPage({ game, playtype, reqUser }: UGPT) {
	const { data, error } = useApiQuery<
		[RecentlyAchievedOrRaisedTargets, RecentlyAchievedOrRaisedTargets]
	>([
		`/users/${reqUser.id}/games/${game}/${playtype}/targets/recently-achieved`,
		`/users/${reqUser.id}/games/${game}/${playtype}/targets/recently-raised`,
	]);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	const [achieved, raised] = data;

	return <div>yeah i haven't done this yet</div>;
}
