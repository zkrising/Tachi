import { ToAPIURL } from "util/api";
import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import { Link } from "react-router-dom";

export function HeaderMobile() {
	const { user } = useContext(UserContext);

	return (
		<>
			<div id="kt_header_mobile" className="header-mobile header-mobile-fixed">
				<div className="d-flex align-items-center justify-content-start">
					<button
						className="btn p-0 burger-icon burger-icon-right ml-2 mr-auto"
						id="kt_header_mobile_toggle"
					>
						<span />
					</button>
				</div>

				<div className="d-flex align-items-center">
					<button
						className="btn btn-icon btn-hover-transparent-white p-0 ml-3"
						id="kt_header_mobile_topbar_toggle"
					>
						{user ? (
							<Link to={`/dashboard/users/${user.username}`}>
								<div className="px-4">
									<img
										className="rounded"
										src={ToAPIURL("/users/me/pfp")}
										style={{
											width: "30px",
											height: "30px",
											display: "inline-block",
										}}
									/>
								</div>
							</Link>
						) : (
							<></>
						)}
					</button>
				</div>
			</div>
		</>
	);
}
