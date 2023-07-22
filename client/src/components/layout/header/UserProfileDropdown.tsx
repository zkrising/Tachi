import { APIFetchV1, ToAPIURL } from "util/api";
import { RFA } from "util/misc";
import { heySplashes } from "util/splashes";
import Divider from "components/util/Divider";
import DropdownToggleOverride from "components/util/DropdownToggleOverride";
import Icon from "components/util/Icon";
import { UserContext } from "context/UserContext";
import React, { useContext, useState } from "react";
import { Button } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { UserDocument } from "tachi-common";
import SupporterIcon from "components/util/SupporterIcon";

export function UserProfileDropdown({ user }: { user: UserDocument }) {
	const { setUser } = useContext(UserContext);
	const [heySplash] = useState(RFA(heySplashes));

	return (
		<Dropdown drop="down" align="end">
			<Dropdown.Toggle as={DropdownToggleOverride} id="dropdown-toggle-user-profile">
				<div
					className={
						"btn btn-icon btn-hover-transparent-white d-flex align-items-center btn-lg px-md-2 w-md-auto"
					}
				>
					<span className="text-white opacity-70 fw-bold font-size-base d-none d-md-inline me-1">
						{heySplash},
					</span>{" "}
					<span className="text-white opacity-90 fw-bolder font-size-base d-none d-md-inline me-2">
						{user.username}
						{user.isSupporter && (
							<>
								{" "}
								<SupporterIcon />
							</>
						)}
					</span>
					<span className="symbol symbol-35 symbol-fixed">
						<img
							alt={"Pic"}
							className="hidden"
							style={{objectFit:"cover"}}
							src={ToAPIURL("/users/me/pfp")}
						/>
					</span>
				</div>
			</Dropdown.Toggle>
			<Dropdown.Menu className="p-0 m-0 dropdown-menu-right dropdown-menu-anim dropdown-menu-top-unround dropdown-menu-xl">
				<div className="navi navi-spacer-x-0 pt-5">
					<Link to={`/u/${user.username}`} className="navi-item px-8 cursor-pointer">
						<div className="navi-link">
							<div className="navi-icon me-2">
								<Icon type="user" colour="primary" />
							</div>
							<div className="navi-text">
								<div className="fw-bold cursor-pointer">My Profile</div>
								<div className="text-muted">View your profile!</div>
							</div>
						</div>
					</Link>
					<Link
						to={`/u/${user.username}/settings`}
						className="navi-item px-8 cursor-pointer"
					>
						<div className="navi-link">
							<div className="navi-icon me-2">
								<Icon type="cog" colour="info" />
							</div>
							<div className="navi-text">
								<div className="fw-bold cursor-pointer">
									Profile Settings
								</div>
								<div className="text-muted">
									Manage your profile picture, status, and more!
								</div>
							</div>
						</div>
					</Link>
					<Link
						to={`/u/${user.username}/integrations`}
						className="navi-item px-8 cursor-pointer"
					>
						<div className="navi-link">
							<div className="navi-icon me-2">
								<Icon type="wrench" colour="danger" />
							</div>
							<div className="navi-text">
								<div className="fw-bold cursor-pointer">
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
							className="btn-outline-danger fw-bold"
						>
							Sign Out
						</Button>
					</div>
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
}
