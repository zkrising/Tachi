import React, { useEffect, useState } from "react";
import { Collapse } from "react-bootstrap";
import { JustChildren } from "types/react";

export default function DropdownRow({
	children,
	className,
	dropdown,
}: { dropdown: React.ReactNode; className?: string } & JustChildren) {
	const [showDropdown, setShowDropdown] = useState(false);

	const [renderDropdown, setRenderDropdown] = useState(false);

	useEffect(() => {
		// temp hack for weird nodejs types (lazy)
		let timeout: any;
		if (!renderDropdown && showDropdown) {
			setRenderDropdown(true);
		} else if (renderDropdown && !showDropdown) {
			timeout = setTimeout(() => {
				if (renderDropdown && !showDropdown) {
					setRenderDropdown(false);
				}
			}, 300);
		}

		return () => {
			clearTimeout(timeout);
		};
	}, [showDropdown]);

	return (
		<>
			<tr className={className} onClick={() => setShowDropdown(!showDropdown)}>
				{children}
			</tr>
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
