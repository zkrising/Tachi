import Divider from "components/util/Divider";
import React, { useContext } from "react";
import { SubheaderContext } from "../../../context/SubheaderContext";
import { Breadcrumbs } from "./components/Breadcrumbs";

export function SubHeader() {
	const subheader = useContext(SubheaderContext);

	return (
		<>
			<div id="kt_subheader" className="subheader">
				<div className="container d-flex align-items-center justify-content-start">
					<div className="d-flex w-100 d-md-none align-items-center justify-content-center">
						<h2 className="text-white font-weight-bold">{subheader.title}</h2>
					</div>
					<div className="d-none d-md-flex flex-wrap mr-1 justify-content-start">
						<div className="d-flex flex-column">
							<h2 className="text-white font-weight-bold my-2 mr-5">
								{subheader.title}
							</h2>

							<Breadcrumbs items={subheader.breadcrumbs} />
						</div>
					</div>
				</div>
			</div>
			<div className="container d-flex mb-8 mt-8 w-100">
				<Divider className="w-100" />
			</div>
		</>
	);
}
