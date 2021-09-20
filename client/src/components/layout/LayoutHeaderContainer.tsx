import Divider from "components/util/Divider";
import React from "react";

export default function UserHeaderContainer({
	header,
	footer,
	children,
}: {
	children: React.ReactChild;
	footer: React.ReactChild;
	header: React.ReactChild;
}) {
	return (
		<div className="row">
			<div className="col-12">
				<div className="card card-custom">
					<div className="card-header">
						<h4>{header}</h4>
					</div>
					<div className="card-body">
						<div className="row align-items-center">{children}</div>
					</div>
					<div className="card-footer pb-0 pt-0">{footer}</div>
				</div>
			</div>
			<div className="col-12">
				<Divider className="mt-8 mb-4" />
			</div>
		</div>
	);
}
