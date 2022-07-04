import useSetSubheader from "components/layout/header/useSetSubheader";
import Divider from "components/util/Divider";
import ExternalLink from "components/util/ExternalLink";
import { TachiConfig } from "lib/config";
import React from "react";

export default function SilentHookPage() {
	useSetSubheader(["Import Scores", "Silent Hook"]);

	return (
		<div>
			<h1 className="text-center mb-4">What Is Silent Hook?</h1>
			<div>
				Silent Hook is a <code>.dll</code> file that hooks into Pop'n and automatically
				sends the scores to a server. {TachiConfig.name} is compatible with what the Silent
				Hook sends, so you can use it to submit scores!
			</div>
			<Divider />
			<h1 className="text-center my-4">Setup Instructions</h1>
			<ol className="instructions-list">
				<li>
					Download <code>silent.dll</code> from{" "}
					<ExternalLink href="https://cdn.discordapp.com/attachments/917508472625573888/938094517226192906/silent.dll">
						Here
					</ExternalLink>
					.
				</li>
				<li>
					Download <code>silent</code>'s dependencies from
					<ExternalLink href="https://cdn.discordapp.com/attachments/683093664192266282/975761045568233513/aksjdfhg.7z">
						Here.
					</ExternalLink>
					<br />
					You must put these files into <code>contents/libssl-1_1.dll</code> and{" "}
					<code>libcrypto-1_1.dll</code>.
				</li>
				<li>
					Download your config file{" "}
					<ExternalLink href="/client-file-flow/CXSilentHook">here</ExternalLink>. <br />
					<b>This file contains an API Key, which is meant to be kept secret!</b>
				</li>
				<li>Place both of these files inside your pop'n folder.</li>
				<li>Your scores now automatically upload to {TachiConfig.name}!</li>
			</ol>
		</div>
	);
}
