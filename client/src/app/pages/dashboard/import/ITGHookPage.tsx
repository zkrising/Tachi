import useSetSubheader from "components/layout/header/useSetSubheader";
import Divider from "components/util/Divider";
import ExternalLink from "components/util/ExternalLink";
import Muted from "components/util/Muted";
import { TachiConfig } from "lib/config";
import React from "react";

export default function ITGHookPage() {
	useSetSubheader(["Import Scores", "ITG Hook"]);

	return (
		<div>
			<h2 className="text-center mb-4">ITG Hook Setup Instructions</h2>
			<ol className="instructions-list">
				<li>
					Download the latest version of <code>Tachi.lua</code>{" "}
					<ExternalLink href="https://github.com/TNG-Dev/Simply-Love-Tachi-Module">
						here
					</ExternalLink>
					.
				</li>
				<li>
					Place <code>Tachi.lua</code> inside <code>Themes/Simply Love/Modules</code>
				</li>
				<li>
					Get your <code>Tachi.json</code> file by clicking{" "}
					<ExternalLink href="/client-file-flow/CXITGHook">this link</ExternalLink>.
				</li>
				<li>
					Place this file inside your user profile. It should go next to
					<code>Groovestats.ini</code>.
				</li>
				<li>That's it! Your scores should now automatically import.</li>
			</ol>
			<Divider />
			<Muted>
				Note: If you submit a score on a chart that {TachiConfig.name} doesn't recognise,
				we'll still store the score, but it won't appear until the chart is registered.
			</Muted>
		</div>
	);
}
