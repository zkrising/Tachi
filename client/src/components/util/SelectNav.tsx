import React from "react";
import { Nav } from "react-bootstrap";
import { JustChildren, SetState } from "types/react";

export default function SelectNav<T>({
	id,
	value,
	setValue,
	children,
	disabled = false,
}: {
	id: T;
	value: T;
	setValue: SetState<T>;
	disabled?: boolean;
} & JustChildren) {
	return (
		<Nav.Item>
			<Nav.Link disabled={disabled} active={id === value} onClick={() => setValue(id)}>
				{children}
			</Nav.Link>
		</Nav.Item>
	);
}
