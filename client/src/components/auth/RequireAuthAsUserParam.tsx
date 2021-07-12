import { ErrorPage } from "app/pages/ErrorPage";
import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import { useHistory, useParams, generatePath } from "react-router-dom";
import { JustChildren } from "types/react";

export default function RequireAuthAsUserParam({ children }: JustChildren) {
	const { userID } = useParams<{ userID: string }>();
	const { user } = useContext(UserContext);
	const history = useHistory();

	if (!user) {
		return <ErrorPage statusCode={401} customMessage="You are not signed in!" />;
	}

	if (userID !== user.id.toString() && userID.toLowerCase() !== user.usernameLowercase) {
		return <ErrorPage statusCode={403} customMessage="You are not authorised to view this." />;
	}

	// redirect to the users actual name.
	if (userID !== user.username) {
		history.push(generatePath(history.location.pathname, { userID: user.username }));
		return null;
	}

	return <>{children}</>;
}
