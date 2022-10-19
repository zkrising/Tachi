import TISInfo from "components/imports/TISInfo";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Divider from "components/util/Divider";
import Muted from "components/util/Muted";
import { TachiConfig } from "lib/config";
import React from "react";

export default function LR2DBPage() {
	useSetSubheader(["Import Scores", "LR2 Database File"]);
	return (
		<>
			<TISInfo name="LR2 Database" />
			<Divider />
			<Muted>
				Note: If you submit a score on a chart that {TachiConfig.name} doesn't recognise,
				you'll need to wait until atleast 2 other players submit scores for that chart
				before it'll show up. This is to combat accidental IR spam.
			</Muted>
		</>
	);
}
