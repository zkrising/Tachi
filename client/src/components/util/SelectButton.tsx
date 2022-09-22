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
	style,
}: {
	id: T;
	value: T;
	setValue: SetState<T>;
	onVariant?: ButtonVariant;
	offVariant?: ButtonVariant;
	disabled?: boolean;
	style?: CSSProperties;
} & JustChildren) {
	return (
		<Button
			disabled={disabled}
			variant={id === value ? onVariant : offVariant}
			onClick={() => setValue(id)}
			style={style}
		>
			{children}
		</Button>
	);
}
