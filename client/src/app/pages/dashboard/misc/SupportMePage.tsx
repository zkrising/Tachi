import useSetSubheader from "components/layout/header/useSetSubheader";
import Divider from "components/util/Divider";
import ExternalLink from "components/util/ExternalLink";
import { TachiConfig } from "lib/config";
import React from "react";
import { Link } from "react-router-dom";

export default function SupportMePage() {
	useSetSubheader("Support / Patreon");

	return (
		<div style={{ fontSize: "1.15rem" }}>
			<p>
				{TachiConfig.name} is a passion project, and developed by{" "}
				<Link to="/dashboard/credits">people like you</Link>.
			</p>
			<p>
				If you want to support {TachiConfig.name} development, you can donate to my{" "}
				<ExternalLink href="https://patreon.com/zkldi">Patreon (Subscription)</ExternalLink>{" "}
				or <ExternalLink href="https://ko-fi.com/zkldi">Ko-Fi (One-Time)</ExternalLink>.
			</p>
			<Divider />
			<p>
				I'm also interested in employment opportunities. You can reach me at{" "}
				<code>zkldi (dot) dev [at] gmail |dot| com</code>.
			</p>
		</div>
	);
}
