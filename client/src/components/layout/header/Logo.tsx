import { ToCDNURL } from "util/api";
import React from "react";
import { Link } from "react-router-dom";
import { TachiConfig } from "lib/config";

export default function Logo() {
	return (
		<Link
			id="home"
			to="/"
			className="p-2 d-none d-md-block focus-ring focus-ring-light transition-color rounded"
		>
			<img
				id="logo"
				height={35}
				alt={TachiConfig.name}
				src={ToCDNURL("/logos/logo-mark.png")}
			/>
		</Link>
	);
}
