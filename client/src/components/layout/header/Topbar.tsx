import React, { useContext } from "react";
import { UserNotificationsDropdown } from "../../../_metronic/layout/components/extras/dropdowns/UserNotificationsDropdown";
import { UserProfileDropdown } from "components/layout/header/UserProfileDropdown";
import { UserContext } from "context/UserContext";
import LinkButton from "components/util/LinkButton";
import SearchBar from "./SearchBar";

export function Topbar() {
	const { user } = useContext(UserContext);

	return (
		<div className="topbar">
			<SearchBar />

			{user ? (
				<>
					<UserNotificationsDropdown />

					{/* <OverlayTrigger
						placement="bottom"
						overlay={<Tooltip id="quick-panel-tooltip">Quick panel</Tooltip>}
					>
						<div
							className="topbar-item"
							data-toggle="tooltip"
							title="Quick panel"
							data-placement="right"
						>
							<div
								className="btn btn-icon btn-hover-transparent-white btn-lg mr-1"
								id="kt_quick_panel_toggle"
							>
								<span className="svg-icon svg-icon-xl">
									<SVG
										src={toAbsoluteUrl(
											"/media/svg/icons/Layout/Layout-4-blocks.svg"
										)}
									/>
								</span>
							</div>
						</div>
					</OverlayTrigger> */}

					<UserProfileDropdown user={user} />
				</>
			) : (
				<>
					<div className="topbar-item mr-3">
						<LinkButton to="/login" className="btn-outline-primary">
							Log In
						</LinkButton>
					</div>
					<div className="topbar-item">
						<LinkButton to="/register">Create Account</LinkButton>
					</div>
				</>
			)}
		</div>
	);
}
