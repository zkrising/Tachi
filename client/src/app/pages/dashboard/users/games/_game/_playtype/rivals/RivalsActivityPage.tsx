import Activity from "components/activity/Activity";
import React from "react";
import { UGPT } from "types/react";

export default function RivalsActivityPage({ reqUser, game, playtype }: UGPT) {
	return <Activity url={`/users/${reqUser.id}/games/${game}/${playtype}/rivals/activity`} />;
}
