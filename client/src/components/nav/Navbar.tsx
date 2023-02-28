import Tabs from "@mui/material/Tabs";
import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";

export default function Navbar({ children }: { children: JSX.Element[] }) {
	const links = children
		.filter((e) => e.props.to)
		.map((e) => {
			const basePath =
				e.props.to[e.props.to.length - 1] === "/"
					? e.props.to.substring(0, e.props.to.length - 1)
					: e.props.to;

			if (e.props.otherMatchingPaths) {
				return [basePath, ...e.props.otherMatchingPaths];
			}
			return [basePath];
		});

	const location = useLocation();

	const value = useMemo(() => {
		const loc = location.pathname.split(/([#?]|\/$)/u)[0];

		let lidx = 0;
		for (let i = 0; i < links.length; i++) {
			const matchingPaths = links[i];

			if (matchingPaths.some((path) => loc.startsWith(path))) {
				lidx = i;
				// break; THIS IS DELIBERATE TO AVOID / matching everything
			}
		}

		return lidx;
	}, [location]);

	return (
		<Tabs
			sx={{
				width: "100%",
				borderRadius: ".42rem",
			}}
			variant="scrollable"
			scrollButtons="auto"
			value={value}
			allowScrollButtonsMobile
		>
			{children}
		</Tabs>
	);
}
