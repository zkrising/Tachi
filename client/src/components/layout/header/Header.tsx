import React from "react";
import { Link } from "react-router-dom";
import { toAbsoluteUrl } from "../../../_metronic/_helpers";
import { Topbar } from "./Topbar";
import { HeaderMenu } from "./HeaderMenu";

export function Header() {
	return (
		<>
			<div className="header header-fixed" id="kt_header">
				<div className="container d-flex align-items-stretch justify-content-between">
					<div className="d-flex align-items-stretch mr-3">
						<div className="header-logo">
							<Link to="/">
								<img
									className="logo-default max-h-40px"
									alt="Logo"
									src={toAbsoluteUrl("/media/logos/logo-mark.png")}
								/>
							</Link>
						</div>

						<HeaderMenu />
					</div>

					<Topbar />
				</div>
			</div>
		</>
	);
}
