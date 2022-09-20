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
}: {
	value: T;
	setValue: SetState<T>;
	children: React.ReactNode;
	allowNull?: boolean;
	style?: React.CSSProperties;
	className?: string;
}) {
	return (
		<Form.Control
			style={style}
			className={className}
			as="select"
			value={value ?? ""}
			onChange={(e) => setValue(e.target.value as T)}
		>
			{allowNull && <option value="">Select...</option>}
			{children}
		</Form.Control>
	);
}
