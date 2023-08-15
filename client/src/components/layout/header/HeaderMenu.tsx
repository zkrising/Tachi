import { AllLUGPTStatsContext } from "context/AllLUGPTStatsContext";
import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext, useEffect } from "react";
import { UserDocument, UserGameStats } from "tachi-common";
import useApiQuery from "components/util/query/useApiQuery";
import Nav from "react-bootstrap/Nav";
import { SetState } from "types/react";
import AllGames from "./AllGames";
import ImportScoresLink from "./ImportScoresLink";
import UtilsDropdown from "./UtilsDropdown";
import UserProfileLinks from "./UserProfileLinks";

const toggleClassNames = "w-100 justify-content-between";
const menuClassNames = "shadow-none shadow-lg-lg";

export function HeaderMenu({
	user,
	dropdownMenuStyle,
	setState,
}: {
	user: UserDocument | null;
	dropdownMenuStyle?: React.CSSProperties;
	setState?: SetState<boolean>;
}) {
	const { ugs, setUGS } = useContext(AllLUGPTStatsContext);
	const { settings } = useContext(UserSettingsContext);

	const { data, error } = useApiQuery<UserGameStats[]>("/users/me/game-stats", undefined, [
		user?.id,
		"game_stats",
	]);

	useEffect(() => {
		if (error) {
			console.error(error);
		}

		if (data) {
			setUGS(data);
		}
	}, [error, data]);

	return (
		<Nav as="nav" className="p-4 d-flex align-content-between gap-4 h-100">
			{user && ugs && ugs.length !== 0 && (
				<UserProfileLinks
					user={user}
					ugs={ugs}
					className={toggleClassNames}
					menuClassName={menuClassNames}
					style={dropdownMenuStyle}
					setState={setState}
				/>
			)}
			<AllGames
				className={toggleClassNames}
				menuClassName={menuClassNames}
				style={dropdownMenuStyle}
				setState={setState}
			/>
			{user && (
				<ImportScoresLink
					className={toggleClassNames}
					menuClassName={menuClassNames}
					style={dropdownMenuStyle}
					setState={setState}
				/>
			)}
			{settings?.preferences.developerMode && (
				<UtilsDropdown
					className={toggleClassNames}
					menuClassName={menuClassNames}
					style={dropdownMenuStyle}
					setState={setState}
				/>
			)}
		</Nav>
	);
}
