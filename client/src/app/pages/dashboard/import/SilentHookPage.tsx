import useSetSubheader from "components/layout/header/useSetSubheader";
import Divider from "components/util/Divider";
import ExternalLink from "components/util/ExternalLink";
import Muted from "components/util/Muted";
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
					<ExternalLink href="https://cdn.discordapp.com/attachments/783119769649414166/1032859092982714428/silent.dll">
						Here
					</ExternalLink>
					and place it in the same folder as <code>popn22.dll</code>.
					<br />
					<Muted>
						The above download is for Kaimei Riddles. For Pop'n Peace, use{" "}
						<ExternalLink href="https://cdn.discordapp.com/attachments/917508472625573888/938094517226192906/silent.dll">
							this download
						</ExternalLink>
						.
					</Muted>
				</li>
				<li>
					Download <code>silent</code>'s dependencies from
					<ExternalLink href="https://cdn.discordapp.com/attachments/683093664192266282/975761045568233513/aksjdfhg.7z">
						Here.
					</ExternalLink>
					<br />
					Put these files in the same folder as <code>silent.dll</code> and <code>popn22.dll</code>.
				</li>
				<li>
					Download your config file to the same folder{" "}
					<ExternalLink href="/client-file-flow/CXSilentHook">here</ExternalLink>. <br />
					<b>This file contains an API Key, which is meant to be kept secret!</b>
				</li>
				<li>
					Add <code>silent</code> to your startup script as a hook.
					<ul class="instructions-list">
						<li>
							BemaniTools5: Add <code>-K silent.dll</code> to your <code>.bat</code> file.
						</li>
						<li>
							SpiceTools &amp; BemaniTools4: Add <code>-k silent.dll</code> to your <code>.bat</code> file.
						</li>
					</ul>
				</li>
				<li>Your scores now automatically upload to {TachiConfig.name}!</li>
			</ol>
		</div>
	);
}
