import React, { useContext } from "react";
import Divider from "components/util/Divider";
import { SubheaderContext } from "../../../context/SubheaderContext";
import { Breadcrumbs } from "./components/Breadcrumbs";

export function SubHeader() {
	const subheader = useContext(SubheaderContext);

	return (
		<>
			<div id="subheader">
				<div id="subheader_content">
					<h2 className="my-2">{subheader.title}</h2>

					<Breadcrumbs items={subheader.breadcrumbs} />
				</div>
			</div>
			<div className="my-2">
				<Divider size="full" />
			</div>
		</>
	);
}
