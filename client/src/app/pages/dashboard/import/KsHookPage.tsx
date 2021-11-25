import useSetSubheader from "components/layout/header/useSetSubheader";
import Divider from "components/util/Divider";
import ExternalLink from "components/util/ExternalLink";
import Muted from "components/util/Muted";
import { TachiConfig } from "lib/config";
import React from "react";

export default function KsHookPage() {
	useSetSubheader(["Import Scores", "Konaste Hook"]);

	return (
		<div>
			<h1 className="text-center mb-4">What Is Konaste Hook?</h1>
			<div>
				Konaste Hook is a <code>.dll</code> file that hooks into SDVX and automatically
				sends the scores to a server. {TachiConfig.name} is compatible with what Konaste
				Hook sends, so you can use it to submit scores!
			</div>
			<Divider />
			<h1 className="text-center my-4">Setup Instructions</h1>
			<ol className="instructions-list">
				<li>
					Download <code>kshook.dll</code> from{" "}
					<ExternalLink href="#">LINK TODO LOL</ExternalLink>.
				</li>
				<li>
					Download your config file{" "}
					<ExternalLink href="/client-file-flow/CXKsHook">here</ExternalLink>. <br />
					<b>This file contains an API Key, which is meant to be kept secret!</b>
				</li>
				<li>I don't know what you do now. TODO!!!</li>
				<li>Your scores now automatically upload to {TachiConfig.name}!</li>
			</ol>
		</div>
	);
}
