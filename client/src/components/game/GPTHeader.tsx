import Navbar from "components/nav/Navbar";
import NavItem from "components/nav/NavItem";
import MiniTable from "components/tables/components/MiniTable";
import ApiError from "components/util/ApiError";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext } from "react";
import { Game } from "tachi-common";
import { GPTStatsReturn } from "types/api-returns";
import { Playtype } from "types/tachi";

export function GPTHeaderBody({ game, playtype }: { game: Game; playtype: Playtype }) {
	const { data, isLoading, error } = useApiQuery<GPTStatsReturn>(`/games/${game}/${playtype}`);

	return (
		<>
			<div className="col-12 col-lg-4 offset-lg-4">
				{error ? (
					<ApiError error={error} />
				) : isLoading || !data ? (
					<Loading />
				) : (
					<MiniTable headers={["Stats"]} colSpan={2}>
						<tr>
							<td>Player Count</td>
							<td>{data.playerCount}</td>
						</tr>
						<tr>
							<td>Available Charts</td>
							<td>{data.chartCount}</td>
						</tr>
						<tr>
							<td>Total Scores</td>
							<td>{data.scoreCount}</td>
						</tr>
					</MiniTable>
				)}
			</div>
		</>
	);
}

export function GPTBottomNav({ baseUrl }: { baseUrl: string }) {
	const { settings } = useContext(UserSettingsContext);

	const navItems = [
		<NavItem key="overview" to={`${baseUrl}/`}>
			Overview
		</NavItem>,
		<NavItem key="songs" to={`${baseUrl}/songs`}>
			Songs
		</NavItem>,
		<NavItem key="leaderboards" to={`${baseUrl}/leaderboards`}>
			Leaderboards
		</NavItem>,
	];

	if (settings?.preferences.developerMode) {
		navItems.push(
			<NavItem key="dev-info" to={`${baseUrl}/dev-info`}>
				Developer Info
			</NavItem>
		);
	}

	return (
		<div className="row align-items-center mb-0">
			<Navbar>{navItems}</Navbar>
		</div>
	);
}
