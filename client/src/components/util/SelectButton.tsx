import React from "react";
import { Button } from "react-bootstrap";
import { JustChildren, SetState } from "types/react";

export default function SelectButton<T>({
	id,
	value,
	setValue,
	children,
	onVariant = "primary",
	offVariant = "outline-secondary",
	disabled = false,
}: {
	id: T;
	value: T;
	setValue: SetState<T>;
	onVariant?: Button["props"]["variant"];
	offVariant?: Button["props"]["variant"];
	disabled?: boolean;
} & JustChildren) {
	return (
		<Button
			disabled={disabled}
			variant={id === value ? onVariant : offVariant}
			onClick={() => setValue(id)}
		>
			{children}
		</Button>
	);
}
