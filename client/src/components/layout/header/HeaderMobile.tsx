import { ToAPIURL } from "util/api";
import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { SetState } from "types/react";
import { UserNotificationButton } from "./UserNotificationButton";
import { SearchButton } from "./SearchButton";

export function HeaderMobile({
	mobileShow,
	setMobileShow,
}: {
	mobileShow: boolean;
	setMobileShow: SetState<boolean>;
}) {
	const { user } = useContext(UserContext);

	return (
		<>
			<div id="kt_header_mobile" className="header-mobile header-mobile-fixed">
				<div className="d-flex align-items-center justify-content-start">
					<button
						className="btn p-0 burger-icon burger-icon-right ml-2 mr-auto"
						id="kt_header_mobile_toggle"
						onClick={() => setMobileShow(!mobileShow)}
					>
						<span />
					</button>
				</div>

				<div className="d-flex align-items-center">
					<SearchButton />

					{user ? (
						<>
							<UserNotificationButton user={user} />
							<button
								className="btn btn-icon btn-hover-transparent-white p-0 ml-3"
								id="kt_header_mobile_topbar_toggle"
							>
								<Link to={`/u/${user.username}`}>
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
							</button>
						</>
					) : (
						<></>
					)}
				</div>
			</div>
		</>
	);
}
