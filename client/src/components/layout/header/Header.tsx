import { APIFetchV1, ToCDNURL } from "util/api";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import { AllLUGPTStatsContext } from "context/AllLUGPTStatsContext";
import { UserContext } from "context/UserContext";
import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext } from "react";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Offcanvas from "react-bootstrap/Offcanvas";
import toast from "react-hot-toast";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { UserGameStats } from "tachi-common";
import AllGames from "./AllGames";
import ImportScoresLink from "./ImportScoresLink";
import UtilsDropdown from "./UtilsDropdown";
import { Endbar } from "./Endbar";
import UserProfileLinks from "./UserProfileLinks";

export function Header() {
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

	if (isLoading) {
		return <Loading />;
	}

	return (
		<header id="header_main" className="fixed-top">
			<Navbar variant="dark" expand="md" className="p-0">
				<Container className="align-center">
					<Navbar.Brand className="logo-default">
						<Link to="/" className="my-auto">
							<img
								alt="Logo"
								src={ToCDNURL("/logos/logo-mark.png")}
								style={{ maxHeight: "40px" }}
							/>
						</Link>
					</Navbar.Brand>
					<Navbar.Toggle aria-controls="offcanvasNavbar-expand-md" />
					<Navbar.Offcanvas
						aria-labelledby={"offcanvasNavbar-expand-md"}
						placement="start"
					>
						<Offcanvas.Header closeButton>
							<Offcanvas.Title>
								{/* ! placeholder ! */}
								<Link className={"fw-bolder display-2 text-primary"} to={"/"}>
									Kamai<span className="text-body">tachi</span>
								</Link>
							</Offcanvas.Title>
						</Offcanvas.Header>
						<Offcanvas.Body>
							<Nav className="ms-4">
								{user && ugs && ugs.length !== 0 && <UserProfileLinks />}

								<AllGames />

								{user && <ImportScoresLink />}
								{/* we can probably move developer utils to the user dropdown.
							it's currently hidden in the rare case the screen is big enough to display the header
							but too small to fit all the icons */}

								{settings?.preferences.developerMode && <UtilsDropdown />}
							</Nav>
							{user && (
								<Button
									className="d-sm-block d-md-none"
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
							)}
						</Offcanvas.Body>
					</Navbar.Offcanvas>
					<Endbar />
				</Container>
			</Navbar>
		</header>
	);
}
