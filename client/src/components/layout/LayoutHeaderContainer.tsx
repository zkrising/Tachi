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
			<Card.Body>{children}</Card.Body>
			<Card.Footer className="p-0">{footer}</Card.Footer>
		</Card>
	);
}
