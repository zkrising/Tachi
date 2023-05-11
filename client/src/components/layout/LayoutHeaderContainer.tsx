import React from "react";
import Card from "react-bootstrap/Card";

export default function UserHeaderContainer({
	footer,
	children,
}: {
	children: React.ReactChild;
	footer: React.ReactChild;
}) {
	return (
		<Card className="mb-4">
			<Card.Body className="d-flex flex-column">{children}</Card.Body>
			<Card.Footer className="card-footer p-0">{footer}</Card.Footer>
		</Card>
	);
}
