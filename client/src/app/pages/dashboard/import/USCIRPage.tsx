import useSetSubheader from "components/layout/header/useSetSubheader";
import Divider from "components/util/Divider";
import ExternalLink from "components/util/ExternalLink";
import Muted from "components/util/Muted";
import { TachiConfig } from "lib/config";
import React from "react";
import { ToServerURL } from "util/api";

export default function USCIRPage() {
	useSetSubheader(["Import Scores", "USC IR"]);

	return (
		<div>
			<h2 className="text-center mb-4">USC IR Setup Instructions</h2>
			<ol className="instructions-list">
				<li>Open USC.</li>
				<li>Open Settings, and go to Online.</li>
				<li>
					Fill out IR Base URL with <code>{ToServerURL("/ir/usc")}</code>.
				</li>
				<li>
					Grab an API Token from{" "}
					<ExternalLink href="/client-file-flow/CXUSCIR">here</ExternalLink>, and place it
					in the API Token field.
				</li>
				<li>That's it! Your scores will now automatically upload to the server.</li>
			</ol>
			<Divider />
			<Muted>
				Note: If you submit a score on a chart that {TachiConfig.name} doesn't recognise,
				you'll need to wait until atleast 2 other players submit scores for that chart
				before it'll show up. This is to combat accidental IR spam.
			</Muted>
		</div>
	);
}
