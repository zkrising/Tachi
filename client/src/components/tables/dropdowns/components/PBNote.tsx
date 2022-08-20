import ExternalLink from "components/util/ExternalLink";
import React from "react";

export default function PBNote() {
	return (
		<small>
			Your PB is the combination of your best score and your best lamp. Read more{" "}
			<ExternalLink href="https://docs.bokutachi.xyz/en/latest/user/pbs-scores/">
				{" "}
				here
			</ExternalLink>
			.
		</small>
	);
}
