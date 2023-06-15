import { APIFetchV1, ToAPIURL } from "util/api";
import { RFA } from "util/misc";
import { heySplashes } from "util/splashes";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import { UserContext } from "context/UserContext";
import React, { useContext, useState } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { UserDocument } from "tachi-common";
import SupporterIcon from "components/util/SupporterIcon";
import { ProfilePictureSmall } from "components/user/ProfilePicture";
import useBreakpoint from "components/util/useBreakpoint";

export function UserProfileDropdown({ user }: { user: UserDocument }) {
	const { setUser } = useContext(UserContext);
	const [heySplash] = useState(RFA(heySplashes));
	const { isMd } = useBreakpoint();

	return (
		<>
			{!isMd ? (
				<ProfilePictureSmall className="header-icon ms-2" user={user} />
			) : (
				<Dropdown className="header-dropdown" id="user-dropdown" align="end">
					<Dropdown.Toggle
						as={"button"}
						className="d-flex justify-content-center align-items-center"
					>
						<span className="d-none d-lg-block">
							<span id={heySplash} className="fw-normal text-body-secondary">
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
						<>
							<img
								alt={`${user.username}'s Profile Picture`}
								className="pfp-small rounded fs-0"
								src={ToAPIURL("/users/me/pfp")}
							/>
						</>
					</Dropdown.Toggle>
					<Dropdown.Menu>
						<div className="pt-3 px-2 d-flex flex-column">
							<Dropdown.Item
								as={Link}
								to={`/u/${user.username}`}
								className="d-flex flex-row align-items-center"
							>
								<Icon
									type="user"
									colour="primary"
									className="me-4"
									style={{ fontSize: "1.2rem" }}
								/>
								<div className="w-100 user-dropdown-item">
									<div className="fw-normal">My Profile</div>
									<div className="fw-light text-body-secondary pe-none">
										View your profile!
									</div>
								</div>
							</Dropdown.Item>
							<Dropdown.Item
								as={Link}
								to={`/u/${user.username}/settings`}
								className="d-flex flex-row align-items-center"
							>
								<Icon
									type="cog"
									colour="info"
									className="me-4"
									style={{ fontSize: "1.2rem" }}
								/>
								<div className="w-100 user-dropdown-item">
									<div className="fw-normal">Profile Settings</div>
									<div className="fw-light text-body-secondary pe-none">
										Manage your profile picture, status, and more!
									</div>
								</div>
							</Dropdown.Item>
							<Dropdown.Item
								as={Link}
								to={`/u/${user.username}/integrations`}
								className="d-flex flex-row align-items-center"
							>
								<Icon
									type="wrench"
									colour="danger"
									className="me-4"
									style={{ fontSize: "1.2rem" }}
								/>
								<div className="w-100 user-dropdown-item">
									<span className="fw-normal">My Integrations</span>
									<div className="fw-light text-body-secondary pe-none position-relative">
										Manage your API Keys and integrations with other services.
									</div>
								</div>
							</Dropdown.Item>
							<Divider className="my-6" />
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
			)}
		</>
	);
}
