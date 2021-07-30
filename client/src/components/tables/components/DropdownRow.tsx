import React, { useState } from "react";
import { Collapse } from "react-bootstrap";
import { JustChildren } from "types/react";

export default function DropdownRow({
	children,
	dropdown,
}: { dropdown: React.ReactNode } & JustChildren) {
	const [showDropdown, setShowDropdown] = useState(false);
	return (
		<>
			<tr onClick={() => setShowDropdown(!showDropdown)}>{children}</tr>
			<tr className="expandable-pseudo-row">
				<td colSpan={100}>
					<Collapse in={showDropdown}>
						<div className="tr-dropdown-container">{dropdown}</div>
					</Collapse>
				</td>
			</tr>
			{/* Fake row to ensure striping stays consistent */}
			<tr className="fake-row"></tr>
		</>
	);
}
