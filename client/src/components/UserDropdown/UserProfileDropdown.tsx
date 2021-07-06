import React, { useContext } from "react";
import { Link } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import { DropdownTopbarItemToggler } from "../../_metronic/_partials/dropdowns";
import Divider from "components/Divider";
import { PublicUserDocument } from "tachi-common";
import { Button } from "react-bootstrap";
import { APIFetchV1 } from "util/api";
import toast from "react-hot-toast";
import { UserContext } from "context/UserContext";

export function UserProfileDropdown({ user }: { user: PublicUserDocument }) {
	const { setUser } = useContext(UserContext);

	return (
		<Dropdown drop="down" alignRight>
			<Dropdown.Toggle as={DropdownTopbarItemToggler} id="dropdown-toggle-user-profile">
				<div
					className={
						"btn btn-icon btn-hover-transparent-white d-flex align-items-center btn-lg px-md-2 w-md-auto"
					}
				>
					<span className="text-white opacity-70 font-weight-bold font-size-base d-none d-md-inline mr-1">
						Hi,
					</span>{" "}
					<span className="text-white opacity-90 font-weight-bolder font-size-base d-none d-md-inline mr-4">
						{user!.username}
					</span>
					<span className="symbol symbol-35">
						<span className="symbol-label text-white font-size-h5 font-weight-bold bg-white-o-30">
							P
						</span>
					</span>
				</div>
			</Dropdown.Toggle>
			<Dropdown.Menu className="p-0 m-0 dropdown-menu-right dropdown-menu-anim dropdown-menu-top-unround dropdown-menu-xl">
				<div className="d-flex align-items-center justify-content-between flex-wrap p-8 rounded-top">
					<div className="symbol bg-white-o-15 mr-3">
						<span className="symbol-label text-success font-weight-bold font-size-h4">
							Foo
						</span>
						{/*<img alt="Pic" className="hidden" src={user.pic} />*/}
					</div>
					<div className="text-white m-0 flex-grow-1 mr-3 font-size-h5">Bar</div>
					<span className="label label-success label-lg font-weight-bold label-inline">
						3 messages
					</span>
				</div>

				<Divider />

				<div className="navi navi-spacer-x-0 pt-5">
					<Link to="/user-profile" className="navi-item px-8 cursor-pointer">
						<div className="navi-link">
							<div className="navi-icon mr-2">
								<i className="flaticon2-calendar-3 text-success" />
							</div>
							<div className="navi-text">
								<div className="font-weight-bold cursor-pointer">My Profile</div>
								<div className="text-muted">
									Account settings and more
									<span className="label label-light-danger label-inline font-weight-bold">
										update
									</span>
								</div>
							</div>
						</div>
					</Link>

					<a className="navi-item px-8">
						<div className="navi-link">
							<div className="navi-icon mr-2">
								<i className="flaticon2-mail text-warning"></i>
							</div>
							<div className="navi-text">
								<div className="font-weight-bold">My Messages</div>
								<div className="text-muted">Inbox and tasks</div>
							</div>
						</div>
					</a>

					<a className="navi-item px-8">
						<div className="navi-link">
							<div className="navi-icon mr-2">
								<i className="flaticon2-rocket-1 text-danger"></i>
							</div>
							<div className="navi-text">
								<div className="font-weight-bold">My Activities</div>
								<div className="text-muted">Logs and notifications</div>
							</div>
						</div>
					</a>

					<a className="navi-item px-8">
						<div className="navi-link">
							<div className="navi-icon mr-2">
								<i className="flaticon2-hourglass text-primary"></i>
							</div>
							<div className="navi-text">
								<div className="font-weight-bold">My Tasks</div>
								<div className="text-muted">latest tasks and projects</div>
							</div>
						</div>
					</a>

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
