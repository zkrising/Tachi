import { APIFetchV1, ToCDNURL } from "util/api";
import Icon from "components/util/Icon";
import { AllLUGPTStatsContext } from "context/AllLUGPTStatsContext";
import { UserContext } from "context/UserContext";
import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Offcanvas from "react-bootstrap/Offcanvas";
import toast from "react-hot-toast";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { UserGameStats } from "tachi-common";
import useBreakpoint from "components/util/useBreakpoint";
import LinkButton from "components/util/LinkButton";
import SiteWordmark from "components/util/SiteWordmark";
import AllGames from "./AllGames";
import ImportScoresLink from "./ImportScoresLink";
import UtilsDropdown from "./UtilsDropdown";
import UserProfileLinks from "./UserProfileLinks";
import { UserNotificationButton } from "./UserNotificationButton";
import { UserProfileDropdown } from "./UserProfileDropdown";

export function Header() {
	const { user, setUser } = useContext(UserContext);
	const { ugs, setUGS } = useContext(AllLUGPTStatsContext);
	const { settings } = useContext(UserSettingsContext);

	const [show, setShow] = useState(false);

	// Only allow offcanvas on small screens
	const { isMd } = useBreakpoint();
	const buttonSize = isMd ? "45px" : "40px";

	useEffect(() => {
		if (isMd) {
			setShow(false);
		}
	});

	const { error } = useQuery([user?.id, "game_stats"], async () => {
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

	const handleLogout = async () => {
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
	};

	return (
		<>
			<header id="tachi-header" className="fixed-top bg-body">
				<Navbar key="md" expand="md" className="p-0 h-100">
					<Container className="h-100">
						<Link
							id="logo"
							to="/"
							onClick={() => window.scrollTo({ top: 0 })}
							className="ms-2 me-4"
						>
							<img
								alt="Logo"
								src={ToCDNURL("/logos/logo-mark.png")}
								style={{ height: "45px" }}
								className="py-1"
							/>
						</Link>
						<button
							onClick={() => setShow(true)}
							aria-controls="offcanvasNav"
							className="header-icon d-md-none"
						>
							<Icon type="bars" />
						</button>
						<Navbar.Offcanvas
							id="offcanvasNav"
							aria-labelledby="offcanvasNav"
							placement="start"
							show={show}
							onHide={() => setShow(false)}
							backdrop={false}
						>
							<Offcanvas.Header>
								<Offcanvas.Title
									onClick={() => {
										setShow(false);
										window.scrollTo({ top: 0 });
									}}
								>
									<Link
										className={"fw-bold display-3 text-primary enable-rfs"}
										to={"/"}
									>
										<SiteWordmark />
									</Link>
								</Offcanvas.Title>
							</Offcanvas.Header>
							<Offcanvas.Body id="offcanvas" className="hide-scrollbar">
								<Nav>
									{user && (
										<UserProfileLinks
											disabled={
												user && ugs && ugs.length !== 0 ? false : true
											}
											onClick={show ? () => setShow(false) : undefined}
										/>
									)}

									<AllGames onClick={show ? () => setShow(false) : undefined} />

									{user && (
										<ImportScoresLink
											onClick={show ? () => setShow(false) : undefined}
										/>
									)}
									{settings?.preferences.developerMode && (
										<UtilsDropdown
											onClick={show ? () => setShow(false) : undefined}
										/>
									)}
									{user && (
										<div
											className="bg-dark position-absolute d-sm-block d-md-none text-end ms-n4 py-2 px-4 w-100 bottom-0"
											style={{ zIndex: 1010 }}
										>
											<Button
												className="w-100"
												variant="outline-danger"
												onClick={handleLogout}
											>
												<Icon type="sign-out-alt" />
												Sign Out
											</Button>
										</div>
									)}
								</Nav>
							</Offcanvas.Body>
							<div
								id="offcanvasNavBackdrop"
								aria-label="offcanvasNavBackdrop"
								className="position-fixed d-md-none pointer-cursor z-n1"
								style={{ inset: 0 }}
								onClick={show ? () => setShow(false) : undefined}
								aria-controls="offcanvasNav"
							/>
						</Navbar.Offcanvas>
						<div className="d-flex justify-content-end align-items-center">
							{isMd ? (
								<Link to="/search" className="header-button mx-2">
									{/* In Progress
									 * <kbd>ctrl</kbd>
									 * <span className="mx-1">+</span>
									 * <kbd>k</kbd>
									 */}
									<Icon type="search" colour="muted" className="ms-4 fs-3" />
								</Link>
							) : (
								<Link to="/search" className="header-icon mx-2">
									<Icon type="search" colour="muted" />
								</Link>
							)}
							{user ? (
								<>
									<UserNotificationButton />
									<UserProfileDropdown user={user} />
								</>
							) : (
								<>
									<div className="d-flex">
										<LinkButton
											style={{ height: buttonSize }}
											to="/register"
											className="d-flex align-items-center ms-2"
											variant="outline-primary"
										>
											Create Account
										</LinkButton>
										<LinkButton
											style={{ height: buttonSize }}
											to="/login"
											className="d-flex align-items-center ms-2"
										>
											Log In
										</LinkButton>
									</div>
								</>
							)}
						</div>
					</Container>
				</Navbar>
			</header>
		</>
	);
}
