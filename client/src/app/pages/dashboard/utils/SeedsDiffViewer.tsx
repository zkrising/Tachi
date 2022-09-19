import useSetSubheader from "components/layout/header/useSetSubheader";
import React from "react";
import { useParams } from "react-router-dom";

export default function SeedsDiffViewer() {
	useSetSubheader(["Developer Utils", "Seeds", "Compare"]);

	const { base, compare } = useParams<{ base?: string; compare?: string }>();

	return <div>SeedsDiffViewer</div>;
}
