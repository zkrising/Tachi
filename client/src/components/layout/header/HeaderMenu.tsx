import { AllLUGPTStatsContext } from "context/AllLUGPTStatsContext";
import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext } from "react";
import { UserDocument, UserGameStats } from "tachi-common";
import useApiQuery from "components/util/query/useApiQuery";
import Nav from "react-bootstrap/Nav";
import AllGames from "./AllGames";
import ImportScoresLink from "./ImportScoresLink";
import UtilsDropdown from "./UtilsDropdown";
import UserProfileLinks from "./UserProfileLinks";

const toggleClassNames = "w-100 justify-content-between w-lg-auto justify-content-lg-start";

export function HeaderMenu({
	user,
	dropdownMenuStyle,
}: {
	user: UserDocument | null;
	dropdownMenuStyle?: React.CSSProperties;
}) {
	const { ugs, setUGS } = useContext(AllLUGPTStatsContext);
	const { settings } = useContext(UserSettingsContext);

	const { data, error } = useApiQuery<UserGameStats[]>("/users/me/game-stats", undefined, [
		user?.id,
		"game_stats",
	]);

	if (error) {
		console.error(error);
	}

	if (data) {
		setUGS(data);
	}

	return (
		<Nav className="p-4 d-flex flex-column flex-md-row align-content-between w-100 gap-2 h-lg-100 overflow-y-auto overflow-y-md-visible scrollbar-hide h-100">
			{user && ugs && ugs.length !== 0 && (
				<UserProfileLinks
					user={user}
					ugs={ugs}
					className={toggleClassNames}
					style={dropdownMenuStyle}
				/>
			)}
			<AllGames className={toggleClassNames} style={dropdownMenuStyle} />
			{user && <ImportScoresLink className={toggleClassNames} style={dropdownMenuStyle} />}
			{settings?.preferences.developerMode && (
				<UtilsDropdown className={toggleClassNames} style={dropdownMenuStyle} />
			)}
		</Nav>
	);
}
