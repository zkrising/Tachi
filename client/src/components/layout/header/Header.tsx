import { ToCDNURL } from "util/api";
import React from "react";
import { Link } from "react-router-dom";
import { SetState } from "types/react";
import { HeaderMenu } from "./HeaderMenu";
import { Topbar } from "./Topbar";

export function Header({
	mobileShow,
	setMobileShow,
}: {
	mobileShow: boolean;
	setMobileShow: SetState<boolean>;
}) {
	return (
		<div className="header header-fixed" id="kt_header">
			<div className="container d-flex align-items-stretch justify-content-between">
				<div className="d-flex align-items-stretch mr-3">
					<div className="header-logo">
						<Link to="/">
							<img
								className="logo-default max-h-40px"
								alt="Logo"
								src={ToCDNURL("/logos/logo-mark.png")}
							/>
						</Link>
					</div>

					<HeaderMenu mobileShow={mobileShow} setMobileShow={setMobileShow} />
				</div>

				<Topbar />
			</div>
		</div>
	);
}
