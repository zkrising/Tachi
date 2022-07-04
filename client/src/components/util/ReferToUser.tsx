import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import { PublicUserDocument } from "tachi-common";

export default function ReferToUser({ reqUser }: { reqUser: PublicUserDocument }) {
	const { user } = useContext(UserContext);

	return <>{user?.id === reqUser.id ? "You have" : `${reqUser.username} has`}</>;
}
