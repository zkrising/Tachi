import { IsSupportedGame, IsSupportedPlaytype } from "util/asserts";
import Loading from "components/util/Loading";
import fetchUGPTData, { UGPTData } from "components/util/query/fetchUGPTData";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { JustChildren, SetState } from "types/react";
import { ErrorPage } from "app/pages/ErrorPage";
import { UserContext } from "./UserContext";

/**
 * Contextually important data meant to be carried around in UGPTs
 * or GPTs.
 *
 * If we're viewing a user's profile (UGPT), then viewingData will
 * contain information about the person we're viewing.
 *
 * If we're viewing a global GPT page (GPT), then viewingData will
 * be null.
 *
 * LoggedInData will be null if a user is not logged in, and non-null
 * if they are.
 *
 * Technically, the name UGPTContext here is misleading - it's
 * actually UGPT or GPT context, but that is a *mouthful*.
 */
export const UGPTContext = createContext<{
	loggedInData: UGPTData | null;
	setLoggedInData: SetState<UGPTData | null>;
	viewingData: UGPTData | null;
	setViewingData: SetState<UGPTData | null>;
}>({
	loggedInData: null,
	setLoggedInData: () => void 0,

	viewingData: null,

	setViewingData: () => void 0,
});

UGPTContext.displayName = "UGPTContext";

export function UGPTContextProvider({ children }: JustChildren) {
	const {
		game,
		playtype,
		userID: viewingUserID,
	} = useParams<{ game: string; userID: string | undefined; playtype: string }>();

	if (!IsSupportedGame(game) || !IsSupportedPlaytype(game, playtype)) {
		throw new Error(`Invalid game of ${game} (${playtype}). Did you mess up?`);
	}

	const { user } = useContext(UserContext);

	const [loggedLoading, setLoggedLoading] = useState(true);
	const [viewingLoading, setViewingLoading] = useState(true);

	const [viewingData, setViewingData] = useState<UGPTData | null>(null);
	const [loggedInData, setLoggedInData] = useState<UGPTData | null>(null);

	useEffect(() => {
		(async () => {
			setLoggedLoading(true);
			setViewingLoading(true);

			if (viewingUserID === undefined) {
				setViewingData(null);
			} else {
				const viewingData = await fetchUGPTData(viewingUserID, game, playtype);

				setViewingData(viewingData);

				if (
					user &&
					// stupid hack because viewingUserID might be a
					// username; also it's a string. dumb.
					(user.id === Number(viewingUserID) ||
						user.usernameLowercase === viewingUserID.toLowerCase())
				) {
					// optimsation: the viewing user and logged
					// in user are the same user.
					// make one fetch instead of two
					setLoggedInData(viewingData);
					setLoggedLoading(false);
					setViewingLoading(false);

					return;
				}
			}

			setViewingLoading(false);

			if (!user) {
				setLoggedInData(null);
			} else {
				const loggedData = await fetchUGPTData(user.id, game, playtype);

				setLoggedInData(loggedData);
			}

			setLoggedLoading(false);
		})();
	}, [user, game, playtype, viewingUserID]);

	if (viewingLoading || loggedLoading) {
		return <Loading />;
	}

	if (!viewingData) {
		return (
			<ErrorPage
				statusCode={400}
				customMessage="This user probably doesn't play this game, or something has gone wrong."
			/>
		);
	}

	return (
		<UGPTContext.Provider
			value={{
				loggedInData,
				setLoggedInData,
				viewingData,
				setViewingData,
			}}
		>
			{children}
		</UGPTContext.Provider>
	);
}
