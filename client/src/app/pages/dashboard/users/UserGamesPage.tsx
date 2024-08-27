import useSetSubheader from "components/layout/header/useSetSubheader";
import React from "react";
import UGPTProfiles from "components/user/UGPTProfiles";
import { UserDocument } from "tachi-common";

export default function UserGamesPage({ reqUser }: { reqUser: UserDocument }) {
	useSetSubheader(
		["Users", reqUser.username, "Games"],
		[reqUser],
		`${reqUser.username}'s Game Profiles`
	);

	return <UGPTProfiles reqUser={reqUser} />;
}
