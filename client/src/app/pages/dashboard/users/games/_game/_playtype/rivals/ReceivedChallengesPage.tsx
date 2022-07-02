import ApiError from "components/util/ApiError";
import DebugContent from "components/util/DebugContent";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import React from "react";
import { Game, Playtype, PublicUserDocument } from "tachi-common";
import { ChallengeSubsReturn } from "types/api-returns";

export default function ReceivedChallengesPage({
	reqUser,
	game,
	playtype,
}: {
	reqUser: PublicUserDocument;
	game: Game;
	playtype: Playtype;
}) {
	const { data, isLoading, error } = useApiQuery<ChallengeSubsReturn>(
		`/users/${reqUser.id}/games/${game}/${playtype}/challenges/subs`
	);

	if (error) {
		<ApiError error={error} />;
	}

	if (isLoading || !data) {
		return <Loading />;
	}

	return (
		<div>
			<DebugContent data={data} />
		</div>
	);
}
