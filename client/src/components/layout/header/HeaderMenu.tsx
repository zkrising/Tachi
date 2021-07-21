import React, { useContext, useEffect } from "react";
import { toAbsoluteUrl } from "../../../_metronic/_helpers";
import Divider from "components/util/Divider";
import { UserContext } from "context/UserContext";
import { useQuery } from "react-query";
import { APIFetchV1 } from "util/api";
import { UserGameStats, FormatGame } from "tachi-common";
import MenuLink from "./MenuLink";
import MenuDropdown from "./MenuDropdown";
import Loading from "components/util/Loading";
import KTLayoutHeader from "_metronic/_assets/js/layout/base/header";
import KTLayoutHeaderMenu from "_metronic/_assets/js/layout/base/header-menu";
import { TachiConfig } from "lib/config";
import AllGames from "./AllGames";

export function HeaderMenu() {
	const { user } = useContext(UserContext);

	const { isLoading, error, data } = useQuery("USER_GAME_STATS", async () => {
		if (!user) {
			return null;
		}

		const res = await APIFetchV1<UserGameStats[]>("/users/me/game-stats");

		if (!res.success) {
			throw res;
		}

		return res.body;
	});

	if (error) {
		console.error(error);
	}

	useEffect(() => {
		if (!isLoading) {
			KTLayoutHeader.init("kt_header", "kt_header_mobile");
			KTLayoutHeaderMenu.init("kt_header_menu", "kt_header_menu_wrapper");
		}
	}, [isLoading]);

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className="header-menu-wrapper header-menu-wrapper-left" id="kt_header_menu_wrapper">
			<div
				id="kt_header_menu"
				className="header-menu header-menu-left header-menu-mobile header-menu-layout-default header-menu-root-arrow"
			>
				<div className="d-lg-none">
					<img
						src={toAbsoluteUrl("/media/logos/logo-wordmark.png")}
						width="100%"
						className="px-10 mt-4"
					/>
					<div className="mt-4">
						<Divider />
					</div>
				</div>
				<ul className="menu-nav">
					{/* <MenuLink name="Dashboard" to="/dashboard" /> */}

					{user && data && data.length !== 0 && (
						<MenuDropdown name="My Games">
							{data.map(e => (
								<MenuLink
									key={`${e.game}:${e.playtype}`}
									name={FormatGame(e.game, e.playtype)}
									to={`/dashboard/users/${user.username}/games/${e.game}/${e.playtype}`}
								/>
							))}
						</MenuDropdown>
					)}

					<AllGames />
				</ul>
			</div>
		</div>
	);
}
