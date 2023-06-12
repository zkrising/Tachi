import { APIFetchV1 } from "util/api";
import Divider from "components/util/Divider";
import ExternalLink from "components/util/ExternalLink";
import { BannedContext } from "context/BannedContext";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ServerStatus } from "types/api-returns";
import Nav from "react-bootstrap/Nav";

export function Footer() {
	const [serverVersion, setServerVersion] = useState("Loading...");
	const { setBanned } = useContext(BannedContext);

	useEffect(() => {
		APIFetchV1<ServerStatus>("/status").then((r) => {
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
		<footer>
			<Divider size="full" className="my-3" />

			<div className="pb-4 d-flex flex-lg-column">
				<div className="container d-flex flex-column flex-lg-row align-items-center justify-content-between">
					<div className="mt-2 mb-md-2 order-1">
						<ExternalLink href="https://en.wikipedia.org/wiki/Dummy_(album)">
							{serverVersion}
						</ExternalLink>
					</div>

					<Nav className="order-0 order-lg-2 justify-content-center">
						<Link
							to="/support"
							className="nav-link px-3 text-body-secondary"
							onClick={() => window.scrollTo(0, 0)}
						>
							Support
						</Link>
						<ExternalLink
							href="https://docs.bokutachi.xyz/wiki/rules"
							className="nav-link px-3 text-body-secondary"
						>
							Rules
						</ExternalLink>
						<Link
							to="/privacy"
							className="nav-link px-3 text-body-secondary"
							onClick={() => window.scrollTo(0, 0)}
						>
							GDPR
						</Link>
						<Link
							to="/credits"
							className="nav-link px-3 text-body-secondary"
							onClick={() => window.scrollTo(0, 0)}
						>
							Credits
						</Link>
						{process.env.VITE_DISCORD && (
							<a
								href={process.env.VITE_DISCORD}
								target="_blank"
								rel="noopener noreferrer"
								className="nav-link px-3 text-body-secondary"
							>
								Discord
							</a>
						)}
						<a
							href="https://github.com/tng-dev/tachi"
							target="_blank"
							rel="noopener noreferrer"
							className="nav-link px-3 text-body-secondary"
						>
							Source Code
						</a>
						<a
							href="https://docs.bokutachi.xyz/"
							target="_blank"
							rel="noopener noreferrer"
							className="nav-link px-3 text-body-secondary"
						>
							Developer Documentation
						</a>
					</Nav>
				</div>
			</div>
		</footer>
	);
}
