import Divider from "components/util/Divider";
import DropdownToggleOverride from "components/util/DropdownToggleOverride";
import Icon from "components/util/Icon";
import { UserContext } from "context/UserContext";
import React, { useContext, useState } from "react";
import { Button } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { PublicUserDocument } from "tachi-common";
import { APIFetchV1, ToAPIURL } from "util/api";
import { RFA } from "util/misc";
import { heySplashes } from "util/splashes";

export function UserProfileDropdown({ user }: { user: PublicUserDocument }) {
	const { setUser } = useContext(UserContext);

	const [heySplash] = useState(RFA(heySplashes));

	return (
		<Dropdown drop="down" alignRight>
			<Dropdown.Toggle as={DropdownToggleOverride} id="dropdown-toggle-user-profile">
				<div
					className={
						"btn btn-icon btn-hover-transparent-white d-flex align-items-center btn-lg px-md-2 w-md-auto"
					}
				>
					<span className="text-white opacity-70 font-weight-bold font-size-base d-none d-md-inline mr-1">
						{heySplash},
					</span>{" "}
					<span className="text-white opacity-90 font-weight-bolder font-size-base d-none d-md-inline mr-4">
						{user.username}
					</span>
					<span className="symbol symbol-35">
						<img alt="Pic" className="hidden" src={ToAPIURL("/users/me/pfp")} />
					</span>
				</div>
			</Dropdown.Toggle>
			<Dropdown.Menu className="p-0 m-0 dropdown-menu-right dropdown-menu-anim dropdown-menu-top-unround dropdown-menu-xl">
				<div className="d-flex align-items-center justify-content-between flex-wrap p-8 rounded-top">
					<div className="symbol bg-white-o-15 mr-3">
						<img className="hidden" src={ToAPIURL("/users/me/pfp")} />
					</div>
					<div className="text-white m-0 flex-grow-1 mr-3 font-size-h5">
						{user.username}
					</div>
				</div>

				<Divider />

				<div className="navi navi-spacer-x-0 pt-5">
					<Link
						to={`/dashboard/users/${user.username}`}
						className="navi-item px-8 cursor-pointer"
					>
						<div className="navi-link">
							<div className="navi-icon mr-2">
								<Icon type="user" colour="primary" />
							</div>
							<div className="navi-text">
								<div className="font-weight-bold cursor-pointer">My Profile</div>
								<div className="text-muted">View your profile!</div>
							</div>
						</div>
					</Link>
					<Link
						to={`/dashboard/users/${user.username}/settings`}
						className="navi-item px-8 cursor-pointer"
					>
						<div className="navi-link">
							<div className="navi-icon mr-2">
								<Icon type="cog" colour="info" />
							</div>
							<div className="navi-text">
								<div className="font-weight-bold cursor-pointer">My Settings</div>
								<div className="text-muted">
									Manage your profile picture, status, and more!
								</div>
							</div>
						</div>
					</Link>
					<Link
						to={`/dashboard/users/${user.username}/integrations`}
						className="navi-item px-8 cursor-pointer"
					>
						<div className="navi-link">
							<div className="navi-icon mr-2">
								<Icon type="wrench" colour="danger" />
							</div>
							<div className="navi-text">
								<div className="font-weight-bold cursor-pointer">
									My Integrations
								</div>
								<div className="text-muted">
									Manage your API Keys and integrations with other services.
								</div>
							</div>
						</div>
					</Link>

					<Divider />

					<div className="navi-footer px-8 py-5 justify-content-end">
						<Button
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
							className="btn-outline-danger font-weight-bold"
						>
							Sign Out
						</Button>
					</div>
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
}
