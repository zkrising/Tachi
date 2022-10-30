import DebugContent from "components/util/DebugContent";
import useApiQuery from "components/util/query/useApiQuery";
import useLUGPTSettings from "components/util/useLUGPTSettings";
import React from "react";
import { PublicUserDocument } from "tachi-common";
import { GamePT } from "types/react";

export default function RivalCompareTop100Page({
	reqUser,
	game,
	playtype,
}: GamePT & {
	reqUser: PublicUserDocument;
}) {
	const { settings } = useLUGPTSettings();

	if (!settings) {
		return <div>You have no settings. How did you get here?</div>;
	}

	const { data, error } = useApiQuery(
		`/users/${reqUser.id}/games/${game}/${playtype}/pbs/best-union?withUser=nythil`
	);

	return (
		<div>
			<DebugContent data={data} />
		</div>
	);
}
