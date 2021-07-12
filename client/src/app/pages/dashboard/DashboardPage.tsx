import { SubheaderContext } from "context/SubheaderContext";
import React, { useContext, useEffect } from "react";

export function DashboardPage() {
	const { setBreadcrumbs, setTitle } = useContext(SubheaderContext);

	useEffect(() => {
		setBreadcrumbs([]);
		setTitle("Dashboard");
	}, []);

	return <>To be honest, I have no idea what is going to go here just yet.</>;
}
