import { APIFetchV1, ToCDNURL } from "util/api";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import { AllLUGPTStatsContext } from "context/AllLUGPTStatsContext";
import { UserContext } from "context/UserContext";
import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext, useRef, useState } from "react";
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

	const offCanvasRef = useRef<HTMLDivElement>(null);
	const [show, setShow] = useState(false);

	const toggleOffcanvas = () => {
		setShow(!show);
	};

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

	return (
		<>
			{
				<div
					className={`tachi-backdrop d-md-none ${show ? "show" : "pe-none"}`}
					onClick={toggleOffcanvas}
				/>
			}
			<header id="tachi-header" className="fixed-top">
				<Navbar variant="dark" key="md" expand="md" className="p-0">
					<Container className="align-center">
						<Navbar.Brand>
							<Link to="/" className="my-auto">
								<img
									alt="Logo"
									src={ToCDNURL("/logos/logo-mark.png")}
									style={{ maxHeight: "40px" }}
								/>
							</Link>
						</Navbar.Brand>
						<Button
							variant="header"
							onClick={toggleOffcanvas}
							aria-controls="offcanvasNavbar"
							className="btn-icon d-md-none"
						>
							<Icon type="bars" />
						</Button>
						<Navbar.Offcanvas
							ref={offCanvasRef}
							id="offcanvasNavbar"
							aria-labelledby="offcanvasNavbar"
							placement="start"
							show={show}
							backdrop={false}
						>
							<Offcanvas.Header>
								<Offcanvas.Title onClick={toggleOffcanvas}>
									{/* ! placeholder ! */}
									<Link
										className={"fw-bolder display-3 text-primary enable-rfs"}
										to={"/"}
									>
										Kamai<span className="text-body">tachi</span>
									</Link>
								</Offcanvas.Title>
							</Offcanvas.Header>
							<Offcanvas.Body id="tachi_offcanvas" className="hide-scrollbar">
								<Nav className="ms-4">
									{user &&
										ugs &&
										ugs.length !== 0 &&
										(show ? (
											<UserProfileLinks onClick={toggleOffcanvas} />
										) : (
											<UserProfileLinks />
										))}

									{show ? <AllGames onClick={toggleOffcanvas} /> : <AllGames />}
									{user &&
										(show ? (
											<ImportScoresLink onClick={toggleOffcanvas} />
										) : (
											<ImportScoresLink />
										))}

									{settings?.preferences.developerMode &&
										(show ? (
											<UtilsDropdown onClick={toggleOffcanvas} />
										) : (
											<UtilsDropdown />
										))}
								</Nav>
								{user && (
									<div
										className="bg-dark position-absolute d-sm-block d-md-none text-end ms-n4 py-2 px-4 w-100 bottom-0"
										style={{ zIndex: 1010 }}
									>
										<Button
											className="w-100"
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
								)}
							</Offcanvas.Body>
						</Navbar.Offcanvas>
						<Endbar />
					</Container>
				</Navbar>
			</header>
		</>
	);
}
