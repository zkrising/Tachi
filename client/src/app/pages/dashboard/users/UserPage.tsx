import Loading from "components/util/Loading";
import React from "react";
import { PublicUserDocument } from "tachi-common";
import { ToAPIURL } from "util/api";
import Divider from "components/util/Divider";
import useSetSubheader from "components/layout/header/useSetSubheader";

export default function UserPage({ reqUser }: { reqUser: PublicUserDocument }) {
	useSetSubheader(["Users", reqUser.username], [reqUser], `${reqUser.username}'s Profile`);

	if (!reqUser) {
		return <Loading />;
	}

	return <></>;
}
