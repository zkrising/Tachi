import { APIFetchV1 } from "util/api";
import { FORMATTED_VERSION } from "util/constants/version";
import Divider from "components/util/Divider";
import ExternalLink from "components/util/ExternalLink";
import { BannedContext } from "context/BannedContext";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ServerStatus } from "types/api-returns";

export function Footer() {
	const [serverVersion, setServerVersion] = useState("Loading...");
	const { setBanned } = useContext(BannedContext);

	useEffect(() => {
		APIFetchV1<ServerStatus>("/status").then(r => {
			if (r.statusCode === 403) {
				setBanned(true);
			}

			if (!r.success) {
				setServerVersion("Error Fetching data!");
			} else {
				setServerVersion(r.body.version);
			}
		});
	}, []);

	return (
		<>
			<Divider className="mt-8" />

			<div className="footer py-4 d-flex flex-lg-column" id="kt_footer">
				<div className="container d-flex flex-column flex-md-row align-items-center justify-content-between">
					<div className="order-2 order-md-1">
						{/* is there a better way to do this? mt-md-3 is the intent */}
						<div className="d-block d-lg-none mt-3"></div>
						Client:{" "}
						<ExternalLink
							href="https://en.wikipedia.org/wiki/Disintegration_(The_Cure_album)"
							className="gentle-link"
						>
							{FORMATTED_VERSION}
						</ExternalLink>
						, Server:{" "}
						<ExternalLink
							href="https://en.wikipedia.org/wiki/Dummy_(album)"
							className="gentle-link"
						>
							{serverVersion}
						</ExternalLink>
					</div>

					<div className="nav nav-dark order-1 order-md-2 justify-content-center">
						<Link
							to="/dashboard/support"
							className="nav-link px-3"
							onClick={() => window.scrollTo(0, 0)}
						>
							Support / Patreon
						</Link>
						<Link
							to="/dashboard/privacy"
							className="nav-link px-3"
							onClick={() => window.scrollTo(0, 0)}
						>
							GDPR
						</Link>
						<Link
							to="/dashboard/credits"
							className="nav-link px-3"
							onClick={() => window.scrollTo(0, 0)}
						>
							Credits
						</Link>
						{process.env.REACT_APP_DISCORD && (
							<a
								href={process.env.REACT_APP_DISCORD}
								target="_blank"
								rel="noopener noreferrer"
								className="nav-link px-3"
							>
								Discord
							</a>
						)}
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
