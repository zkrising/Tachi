import useSetSubheader from "components/layout/header/useSetSubheader";
import BMSCourseLookupTable from "components/tables/seeds/BMSCourseLookupTable";
import React from "react";

export default function SeedsViewer() {
	useSetSubheader(["Developer Utils", "Seeds"]);

	return <BMSCourseLookupTable dataset={} />;
}
