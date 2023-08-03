import React, { CSSProperties } from "react";
import { Button } from "react-bootstrap";
import { ButtonVariant } from "react-bootstrap/esm/types";
import { JustChildren, SetState } from "types/react";

export default function SelectButton<T>({
	id,
	value,
	setValue,
	children,
	onVariant = "primary",
	offVariant = "outline-secondary",
	disabled = false,
	onStyle = {},
	offStyle = {},
	style = {},
	className = "",
}: {
	id: T;
	value: T;
	setValue: SetState<T>;
	onVariant?: ButtonVariant;
	offVariant?: ButtonVariant;
	disabled?: boolean;
	style?: CSSProperties;
	onStyle?: CSSProperties;
	offStyle?: CSSProperties;
	className?: string;
} & JustChildren) {
	const active = id === value;
	return (
		<Button
			disabled={disabled}
			variant={active ? onVariant : offVariant}
			onClick={() => setValue(id)}
			style={active ? Object.assign(style, onStyle) : Object.assign(style, offStyle)}
			className={`${active ? "" : "text-body text-light-hover"} ${className}`}
		>
			{children}
		</Button>
	);
}
