import React, { Fragment } from "react";
import { Link } from "react-router-dom";
// import { GetGameConfig } from "tachi-common";
import Icon from "components/util/Icon";

export function Breadcrumbs({ items }: { items: string[] }) {
	const url = location.pathname;

	// we also need to remove the first param, as it is an empty string
	const parts = url.split("/").slice(1);

	return (
		<div id={"breadcrumbs"} className="my-2">
			<Link className="text-white opacity-75 hover-opacity" to="/">
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
						<Icon
							type="circle"
							style={{ fontSize: "4px", margin: "0 10px" }}
							colour="white"
							className="opacity-75"
						/>
						<Link
							className="text-white opacity-75 hover-opacity"
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
