import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { GetGameConfig } from "tachi-common";

export function Breadcrumbs({ items }: { items: string[] }) {
	const url = location.pathname;

	// we also need to remove the first param, as it is an empty string
	const parts = url.split("/").slice(1);

	return (
		<div className="align-items-center fw-bold my-2 d-flex">
			<Link className="opacity-75 hover-opacity-100" to="/">
				<i className="flaticon2-shelter text-white icon-1x" />
			</Link>
			{items.map((name, index) => {
				// Skip playtype in the breadcrumbs if the game only has one playtype.
				// @hack
				// this only works if the game has one playtype called "Single".
				// Some games (like pop'n) have one playtype, but it's called
				// 9B. They'll just have to cope.
				if (items[index - 2] === "Games" && name === "Single") {
					return;
				}

				return (
					<Fragment key={index}>
						<span className="label label-dot label-sm bg-white opacity-75 mx-3" />
						<Link
							className="text-white text-hover-white opacity-75 hover-opacity-100"
							to={`/${parts.slice(0, index + 1).join("/")}`}
						>
							{name}
						</Link>
					</Fragment>
				);
			})}
		</div>
	);
}
