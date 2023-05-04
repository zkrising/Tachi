import { ToCDNURL } from "util/api";
import { HistorySafeGoBack } from "util/misc";
import useSetSubheader from "components/layout/header/useSetSubheader";
import React from "react";
import { useHistory } from "react-router-dom";

export function ErrorPage({
	statusCode,
	customMessage,
}: {
	statusCode: number;
	customMessage?: string;
}) {
	useSetSubheader(statusCode ? statusCode.toString() : "Completely Screwed.");

	let message;

	const history = useHistory();

	if (!customMessage) {
		switch (statusCode) {
			case 400:
				message = "The server refused this request.";
				break;
			case 401:
				message = "Looks like you're not authorised. Try logging in.";
				break;
			case 403:
				message = "Looks like you're not allowed to be here.";
				break;
			case 404:
				message = "This page does not exist. If you think it should exist, let us know!";
				break;
			case 429:
				message = "You're being rate limited. If this was unexpected, please report this.";
				break;
			case 500:
				message = "Looks like the server has failed. This has been reported!";
				break;
			case undefined:
				message =
					"Looks like the server has completely crashed. Ah well. Try reloading, but there's no promises.";
				break;
			default:
				message = "An unexpected error has occurred. This has been reported!";
				break;
		}
	} else {
		message = customMessage;
	}

	return (
		<div
			className="fullscreen text-center user-select-none"
			style={
				statusCode === 999
					? {
							background: "red",
							backgroundImage: `url(${ToCDNURL("/eggs/michael.png")})`,
							backgroundRepeat: "no-repeat",
							backgroundPosition: "center",
							backgroundSize: "cover",
					  }
					: undefined
			}
		>
			<div className="d-flex h-100 align-items-center justify-content-center px-2">
				<div className="flex-grow-1">
					<div className="display-1 fw-bolder enable-rfs">
						{statusCode || "Completely Screwed."}
					</div>
					<h3 className="enable-rfs">{message}</h3>
					<a
						className="cursor-pointer"
						onClick={() => HistorySafeGoBack(history)}
						style={statusCode === 999 ? { color: "red", fontSize: "24px" } : undefined}
					>
						Go Back.
					</a>
				</div>
			</div>
		</div>
	);
}
