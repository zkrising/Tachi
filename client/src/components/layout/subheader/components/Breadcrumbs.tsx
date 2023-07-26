import Icon from "components/util/Icon";
import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { GetGameConfig } from "tachi-common";

export function Breadcrumbs({ items }: { items: string[] }) {
	const url = location.pathname;

	// we also need to remove the first param, as it is an empty string
	const parts = url.split("/").slice(1);

	return (
		<div className="d-none d-md-flex align-items-center fw-semibold">
			<Link
				className="link-light link-opacity-75 link-opacity-100-hover transition-color"
				to="/"
			>
				<Icon type="home" />
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
						<span
							id="dot"
							className="h-2 w-2 d-block bg-light rounded-circle bg-opacity-75 mx-3"
						/>
						<Link
							className="link-light link-opacity-75 link-opacity-100-hover transition-color"
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
