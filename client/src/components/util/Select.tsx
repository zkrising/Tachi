import React from "react";
import { Form } from "react-bootstrap";
import { SetState } from "types/react";

export default function Select<T extends string | null>({
	value,
	setValue,
	children,
	allowNull = false,
	style,
	className,
	unselectedName = "Select...",
}: {
	value: T;
	setValue: SetState<T>;
	children: React.ReactNode;
	allowNull?: boolean;
	style?: React.CSSProperties;
	className?: string;
	unselectedName?: string;
}) {
	return (
		<Form.Control
			style={style}
			className={className}
			as="select"
			value={value ?? ""}
			onChange={(e) => setValue((e.target.value === "" ? null : e.target.value) as T)}
		>
			{allowNull && <option value="">{unselectedName}</option>}
			{children}
		</Form.Control>
	);
}
