import useSetSubheader from "components/layout/header/useSetSubheader";
import Divider from "components/util/Divider";
import ExternalLink from "components/util/ExternalLink";
import { TachiConfig } from "lib/config";
import React from "react";

export default function WACCASiteImportPage() {
	useSetSubheader(["Import Scores", "WACCA Site Importer"]);

	return (
		<div>
			<h1 className="text-center mb-4">What Is The WACCA Site Importer?</h1>
			<div>
				The WACCA Site Importer is a script that will scrape your profile on the WACCA
				website and imports it to {TachiConfig.name}.
			</div>
			<Divider />
			<h1 className="text-center my-4">Setup Instructions</h1>
			Instructions are available on{" "}
			<ExternalLink href="https://github.com/cg505/kt-wacca-site-importer">
				the GitHub repository
			</ExternalLink>
			.
		</div>
	);
}
