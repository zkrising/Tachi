import { APIFetchV1, ToCDNURL } from "util/api";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import useComponentVisible from "components/util/useComponentVisible";
import { UserContext } from "context/UserContext";
import { AllLUGPTStatsContext } from "context/AllLUGPTStatsContext";
import { TachiConfig } from "lib/config";
import React, { useContext, useEffect } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { FormatGame, GetGameConfig, UserGameStats } from "tachi-common";
import { SetState } from "types/react";
import { UserSettingsContext } from "context/UserSettingsContext";
import { Button } from "react-bootstrap";
import Icon from "components/util/Icon";
import toast from "react-hot-toast";
import AllGames from "./AllGames";
import ImportScoresLink from "./ImportScoresLink";
import MenuDropdown from "./MenuDropdown";
import MenuLink from "./MenuLink";
import SearchBar from "./SearchBar";
import UtilsDropdown from "./UtilsDropdown";

export function HeaderMenu({
	mobileShow,
	setMobileShow,
}: {
	mobileShow: boolean;
	setMobileShow: SetState<boolean>;
}) {
	const { user, setUser } = useContext(UserContext);
	const { ugs, setUGS } = useContext(AllLUGPTStatsContext);
	const { settings } = useContext(UserSettingsContext);

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

	const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(mobileShow);

	// how does this not cause a problem. What?
	useEffect(() => {
		setIsComponentVisible(mobileShow);
	}, [mobileShow]);

	useEffect(() => {
		setMobileShow(isComponentVisible);
	}, [isComponentVisible]);

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
			for (const playtype of GetGameConfig(game).playtypes) {
				const e = ugsMap.get(`${game}:${playtype}`);

				if (!e) {
					continue;
				}

				userProfileLinks.push(
					<MenuLink
						key={`${e.game}:${e.playtype}`}
						name={FormatGame(e.game, e.playtype)}
						to={`/u/${user.username}/games/${e.game}/${e.playtype}`}
					/>
				);
			}
		}
	}

	return (
		<div
			className={`header-menu-wrapper header-menu-wrapper-left ${
				isComponentVisible ? "header-menu-wrapper-on" : ""
			}`}
			ref={ref}
			id="kt_header_menu_wrapper"
		>
			<div className="d-flex h-100" style={{ flexDirection: "column" }}>
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

						{settings?.preferences.developerMode && <UtilsDropdown />}
					</ul>
				</div>
				<div
					className="d-flex d-lg-none"
					style={{ paddingLeft: "30px", marginBottom: "2rem", flex: "1 1 auto" }}
				>
					<div>
						<Divider />
					</div>
					<Button
						style={{ alignSelf: "flex-end" }}
						variant="outline-danger"
						onClick={async () => {
							if (confirm("Are you sure you want to sign out?")) {
								const rj = await APIFetchV1("/auth/logout", {
									method: "POST",
								});

								if (rj.success) {
									toast.success("Logged out.");
									setTimeout(() => {
										setUser(null);
										localStorage.removeItem("isLoggedIn");
										// This has to be the case.
										// Otherwise, react just ruins its own
										// state. I hate react state.
										window.location.href = "/";
									}, 500);
								}
							}
						}}
					>
						<Icon type="sign-out-alt" />
						Sign Out
					</Button>
				</div>
			</div>
		</div>
	);
}
