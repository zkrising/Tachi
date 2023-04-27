import { APIFetchV1, ToAPIURL } from "util/api";
import { RFA } from "util/misc";
import { heySplashes } from "util/splashes";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import { UserContext } from "context/UserContext";
import React, { useContext, useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { UserDocument } from "tachi-common";
import SupporterIcon from "components/util/SupporterIcon";

export function UserProfileDropdown({ user }: { user: UserDocument }) {
	const { setUser } = useContext(UserContext);
	const [heySplash] = useState(RFA(heySplashes));
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768);
		};
		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<Dropdown id="user-dropdown" align="end">
			{isMobile ? (
				<Link to={`/u/${user.username}`} className="btn btn-header btn-icon">
					<span>
						<img
							alt={"Pic"}
							className="hidden pfp-small rounded"
							src={ToAPIURL("/users/me/pfp")}
						/>
					</span>
				</Link>
			) : (
				<Dropdown.Toggle variant="header">
					<span id="user-dropdown-text">
						<span id={heySplash} className="fw-normal text-muted">
							{heySplash},{" "}
						</span>
						<span id="username" className="fw-bolder me-2">
							{user.username}{" "}
							{user.isSupporter && (
								<>
									{" "}
									<SupporterIcon />
								</>
							)}
						</span>
					</span>
					<span>
						<img
							alt={"Pic"}
							className="hidden pfp-small rounded"
							src={ToAPIURL("/users/me/pfp")}
						/>
					</span>
				</Dropdown.Toggle>
			)}
			<Dropdown.Menu className="user-dropdown-menu">
				<div className="pt-3 px-2 d-flex flex-column">
					<div>
						<Link
							to={`/u/${user.username}`}
							className="d-flex flex-row align-items-center gentle-link my-2"
						>
							<Icon
								type="user"
								colour="primary"
								className="me-4"
								style={{ fontSize: "1.2rem" }}
							/>
							<div>
								<div className="fw-normal">My Profile</div>
								<div className="fw-light text-muted pe-none">
									View your profile!
								</div>
							</div>
						</Link>
					</div>
					<Link
						to={`/u/${user.username}/settings`}
						className="d-flex flex-row align-items-center gentle-link my-3"
					>
						<Icon
							type="cog"
							colour="info"
							className="me-4"
							style={{ fontSize: "1.2rem" }}
						/>
						<div>
							<div className="fw-normal">Profile Settings</div>
							<div className="fw-light text-muted pe-none">
								Manage your profile picture, status, and more!
							</div>
						</div>
					</Link>
					<div>
						<Link
							to={`/u/${user.username}/integrations`}
							className="d-flex flex-row align-items-center gentle-link mt-2"
						>
							<Icon
								type="wrench"
								colour="danger"
								className="me-4"
								style={{ fontSize: "1.2rem" }}
							/>
							<div>
								<span className="fw-normal">My Integrations</span>
								<div className="fw-light text-muted pe-none">
									Manage your API Keys and integrations with other services.
								</div>
							</div>
						</Link>
					</div>
					<Divider className="my-4" />
				</div>

				<div className="px-2 pb-2">
					<Button
						variant="outline-danger"
						className="float-end mb-2"
						onClick={async () => {
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
						}}
					>
						Sign Out
					</Button>
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
}
