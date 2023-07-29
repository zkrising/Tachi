import React, { useContext } from "react";
import { Container } from "react-bootstrap";
import { SubheaderContext } from "../../../context/SubheaderContext";
import { LayoutStyles } from "../Layout";
import { Breadcrumbs } from "./components/Breadcrumbs";

export function SubHeader({ styles }: { styles: LayoutStyles }) {
	const subheader = useContext(SubheaderContext);
	return (
		<>
			<header
				id="subheader"
				className="bg-black bg-opacity-50"
				style={{ marginTop: `${styles.headerHeight}px` }}
			>
				<Container
					className="d-flex flex-column justify-content-center align-items-center align-items-md-start gap-4"
					style={{ height: styles.backgroundHeight }}
				>
					<h2 className="fw-bold">{subheader.title}</h2>

					<Breadcrumbs items={subheader.breadcrumbs} />
				</Container>
			</header>
		</>
	);
}
