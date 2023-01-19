import ExternalLink from "components/util/ExternalLink";
import React from "react";

export default function PBNote() {
	return (
		<small>
			Your PB is the combination of your best score and your best clear. Read more{" "}
			<ExternalLink href="https://docs.bokutachi.xyz/wiki/pbs-scores/"> here</ExternalLink>.
		</small>
	);
}
