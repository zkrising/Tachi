import React, { useEffect, useMemo, useState } from "react";
import { Collapse } from "react-bootstrap";
import { JustChildren } from "types/react";

export default function DropdownRow({
	children,
	dropdown,
}: { dropdown: React.ReactNode } & JustChildren) {
	const [showDropdown, setShowDropdown] = useState(false);

	const [renderDropdown, setRenderDropdown] = useState(false);

	useEffect(() => {
		if (!renderDropdown && showDropdown) {
			setRenderDropdown(true);
		} else if (renderDropdown && !showDropdown) {
			setTimeout(() => {
				if (renderDropdown && !showDropdown) {
					setRenderDropdown(false);
				}
			}, 300);
		}
	}, [showDropdown]);

	return (
		<>
			<tr onClick={() => setShowDropdown(!showDropdown)}>{children}</tr>
			<tr className="expandable-pseudo-row">
				<td colSpan={100}>
					<Collapse in={showDropdown}>
						{renderDropdown ? (
							<div className="tr-dropdown-container">{dropdown}</div>
						) : (
							<div></div>
						)}
					</Collapse>
				</td>
			</tr>
			{/* Fake row to ensure striping stays consistent */}
			<tr className="fake-row"></tr>
		</>
	);
}
