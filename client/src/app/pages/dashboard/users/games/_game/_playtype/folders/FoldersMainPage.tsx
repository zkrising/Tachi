import useSetSubheader from "components/layout/header/useSetSubheader";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import SelectLinkButton from "components/util/SelectLinkButton";
import useUGPTBase from "components/util/useUGPTBase";
import { UserContext } from "context/UserContext";
import { UserGameStatsContext } from "context/UserGameStatsContext";
import React, { useContext } from "react";
import { Route, Switch } from "react-router-dom";
import { FormatGame, GetGameConfig, PublicUserDocument } from "tachi-common";
import { GamePT } from "types/react";
import FolderSelectPage from "./FolderSelectPage";
import FolderTablePage from "./FolderTablePage";
import RecentFoldersPage from "./RecentFoldersPage";
import SpecificFolderPage from "./SpecificFolderPage";

type Props = { reqUser: PublicUserDocument } & GamePT;

export default function FoldersMainPage({ reqUser, game, playtype }: Props) {
	const gameConfig = GetGameConfig(game);

	const { user } = useContext(UserContext);
	const { ugs } = useContext(UserGameStatsContext);

	useSetSubheader(
		["Users", reqUser.username, "Games", gameConfig.name, playtype, "Folders"],
		[reqUser, game, playtype],
		`${reqUser.username}'s ${FormatGame(game, playtype)} Folders`
	);

	const base = useUGPTBase({ reqUser, game, playtype });

	return (
		<div className="row">
			<div className="col-12 text-center">
				<div className="btn-group">
					{user && ugs?.find(x => x.game === game && x.playtype === playtype) && (
						<SelectLinkButton to={`${base}/folders/recent`}>
							<Icon type="clock" />
							{user.id === reqUser.id
								? "Recent Folders"
								: "Your Recently Viewed Folders"}
						</SelectLinkButton>
					)}

					<SelectLinkButton to={`${base}/folders`}>
						<Icon type="table" />
						Table Overview
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/folders/search`}>
						<Icon type="search" />
						Folder Select
					</SelectLinkButton>
				</div>
				<Divider />
			</div>
			<div className="col-12">
				<Switch>
					<Route exact path="/dashboard/users/:userID/games/:game/:playtype/folders">
						<FolderTablePage {...{ reqUser, game, playtype }} />
					</Route>
					<Route
						exact
						path="/dashboard/users/:userID/games/:game/:playtype/folders/search"
					>
						<FolderSelectPage {...{ reqUser, game, playtype }} />
					</Route>
					<Route
						exact
						path="/dashboard/users/:userID/games/:game/:playtype/folders/recent"
					>
						<RecentFoldersPage {...{ reqUser, game, playtype }} />
					</Route>
					<Route
						exact
						path="/dashboard/users/:userID/games/:game/:playtype/folders/:folderID"
					>
						<SpecificFolderPage {...{ reqUser, game, playtype }} />
					</Route>
				</Switch>
			</div>
		</div>
	);
}
