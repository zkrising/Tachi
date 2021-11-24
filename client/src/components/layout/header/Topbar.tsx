import { UserProfileDropdown } from "components/layout/header/UserProfileDropdown";
import LinkButton from "components/util/LinkButton";
import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import SearchBar from "./SearchBar";

export function Topbar() {
	const { user } = useContext(UserContext);

	return (
		<div className="topbar" style={{ minWidth: "35%" }}>
			<SearchBar />

			{user ? (
				<>
					{/* commented out quick panel stuff for future */}
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
											"/cdn/svg/icons/Layout/Layout-4-blocks.svg"
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
