import { APIFetchV1, ToCDNURL } from "util/api";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import { UserContext } from "context/UserContext";
import { UserGameStatsContext } from "context/UserGameStatsContext";
import { TachiConfig } from "lib/config";
import React, { useContext, useLayoutEffect } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { FormatGame, GetGameConfig, UserGameStats } from "tachi-common";
import KTLayoutHeader from "_metronic/_assets/js/layout/base/header";
import KTLayoutHeaderMenu from "_metronic/_assets/js/layout/base/header-menu";
import AllGames from "./AllGames";
import ImportScoresLink from "./ImportScoresLink";
import MenuDropdown from "./MenuDropdown";
import MenuLink from "./MenuLink";
import SearchBar from "./SearchBar";

export function HeaderMenu() {
	const { user } = useContext(UserContext);
	const { ugs, setUGS } = useContext(UserGameStatsContext);

	const { isLoading, error } = useQuery([user?.id, "game_stats"], async () => {
		if (!user) {
			return null;
		}

		const res = await APIFetchV1<UserGameStats[]>("/users/me/game-stats");

		if (!res.success) {
			throw res;
		}

		return setUGS(res.body);
	});

	if (error) {
		console.error(error);
	}

	useLayoutEffect(() => {
		if (!isLoading) {
			KTLayoutHeader.init("kt_header", "kt_header_mobile");
			KTLayoutHeaderMenu.init("kt_header_menu", "kt_header_menu_wrapper");
		}
	}, [isLoading]);

	if (isLoading) {
		return <Loading />;
	}

	const userProfileLinks = [];

	if (user && ugs && ugs.length !== 0) {
		const ugsMap = new Map();
		for (const s of ugs) {
			ugsMap.set(`${s.game}:${s.playtype}`, s);
		}

		for (const game of TachiConfig.games) {
			for (const playtype of GetGameConfig(game).validPlaytypes) {
				const e = ugsMap.get(`${game}:${playtype}`);

				if (!e) {
					continue;
				}

				userProfileLinks.push(
					<MenuLink
						key={`${e.game}:${e.playtype}`}
						name={FormatGame(e.game, e.playtype)}
						to={`/dashboard/users/${user.username}/games/${e.game}/${e.playtype}`}
					/>
				);
			}
		}
	}

	return (
		<div className="header-menu-wrapper header-menu-wrapper-left" id="kt_header_menu_wrapper">
			<div
				id="kt_header_menu"
				className="header-menu header-menu-left header-menu-mobile header-menu-layout-default header-menu-root-arrow"
			>
				<div className="d-lg-none">
					<Link to="/">
						<img
							src={ToCDNURL("/logos/logo-wordmark.png")}
							width="100%"
							className="px-10 mt-4"
						/>
					</Link>

					<div className="mt-4">
						<Divider />
					</div>
				</div>
				<ul className="menu-nav">
					<li className="menu-item d-block d-lg-none">
						<div className="d-flex w-100 mb-8 px-4">
							<SearchBar />
						</div>
						<Divider />
					</li>

					{user && ugs && ugs.length !== 0 && (
						<MenuDropdown name="Your Profiles">{userProfileLinks}</MenuDropdown>
					)}

					<AllGames />

					{user && <ImportScoresLink />}
				</ul>
			</div>
		</div>
	);
}
