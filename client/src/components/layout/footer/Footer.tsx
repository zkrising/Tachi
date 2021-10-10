import Divider from "components/util/Divider";
import React from "react";
import { Link } from "react-router-dom";
import { FORMATTED_VERSION } from "util/constants/version";

export function Footer() {
	return (
		<>
			<Divider className="mt-8" />

			<div className="footer py-4 d-flex flex-lg-column" id="kt_footer">
				<div className="container d-flex flex-column flex-md-row align-items-center justify-content-between">
					<div className="order-2 order-md-1">
						{/* is there a better way to do this? mt-md-3 is the intent */}
						<div className="d-block d-lg-none mt-3"></div>
						<span className="px-3">{FORMATTED_VERSION}</span>
					</div>

					<div className="nav nav-dark order-1 order-md-2 justify-content-center">
						<Link
							to="/dashboard/credits"
							className="nav-link px-3"
							onClick={() => window.scrollTo(0, 0)}
						>
							Credits
						</Link>
						<a
							href="#"
							target="_blank"
							rel="noopener noreferrer"
							className="nav-link px-3"
						>
							Discord
						</a>
						<a
							href="https://github.com/tng-dev/tachi-server"
							target="_blank"
							rel="noopener noreferrer"
							className="nav-link px-3"
						>
							Source Code
						</a>
						<a
							href="https://tachi.readthedocs.io/"
							target="_blank"
							rel="noopener noreferrer"
							className="nav-link px-3"
						>
							Developer Documentation
						</a>
					</div>
				</div>
			</div>
		</>
	);
}
