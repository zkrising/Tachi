import Icon from "components/util/Icon";
import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { DropdownToggleProps } from "react-bootstrap/esm/DropdownToggle";
import { AlignType } from "react-bootstrap/esm/types";

export interface QuickDropdownProps extends DropdownToggleProps {
	/**Text or JSX to render in the toggle button*/
	toggle: React.ReactNode;
	/**Render a caret*/
	caret?: boolean;
	caretPosition?: "start" | "end";
	/**Which position of the toggle the dropdown should align to*/
	align?: AlignType;
	menuStyle?: React.CSSProperties;
	menuClassName?: string;
	dropdownClassName?: string;
}

export default function QuickDropdown({
	align,
	id,
	variant = "dark",
	toggle,
	caret,
	caretPosition = "end",
	className = "",
	menuStyle,
	menuClassName = "",
	dropdownClassName,
	children,
	...props
}: QuickDropdownProps) {
	const caretClassName = caretPosition === "start" ? "me-4" : "ms-4";
	return (
		<Dropdown id={id} align={align} className={dropdownClassName}>
			<Dropdown.Toggle
				id={id ? `${id}-toggle` : undefined}
				variant={variant}
				// eslint-disable-next-line prettier/prettier
				className={`${className} fw-semibold align-items-center d-flex${caret && caretPosition === "start" ? " flex-row-reverse" : ""}`}
				{...props}
			>
				{toggle}
				{caret && <Icon type="chevron-down" className={`small ${caretClassName}`} />}
			</Dropdown.Toggle>
			<Dropdown.Menu
				id={id ? `${id}-menu` : undefined}
				style={menuStyle}
				className={`animate-fade-in ${menuClassName}`}
			>
				{children}
			</Dropdown.Menu>
		</Dropdown>
	);
}
