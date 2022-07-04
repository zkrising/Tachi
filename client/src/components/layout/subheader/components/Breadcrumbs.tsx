import React, { Fragment } from "react";
import { Link } from "react-router-dom";

export function Breadcrumbs({ items }: { items: string[] }) {
	const url = location.pathname;

	// we also need to remove the first param, as it is an empty string
	// and the second param, as dashboard is implicitly handled.
	const parts = url.split("/").slice(2);

	return (
		<div className="align-items-center font-weight-bold my-2 d-flex">
			<Link className="opacity-75 hover-opacity-100" to="/dashboard">
				<i className="flaticon2-shelter text-white icon-1x" />
			</Link>
			{items.map((name, index) => (
				<Fragment key={index}>
					<span className="label label-dot label-sm bg-white opacity-75 mx-3" />
					<Link
						className="text-white text-hover-white opacity-75 hover-opacity-100"
						to={`/dashboard/${parts.slice(0, index + 1).join("/")}`}
					>
						{name}
					</Link>
				</Fragment>
			))}
		</div>
	);
}
