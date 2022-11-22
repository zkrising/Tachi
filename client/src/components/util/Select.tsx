import React from "react";
import { Form } from "react-bootstrap";

export default function Select<T extends string | null>({
	value,
	setValue,
	children,
	allowNull = false,
	style,
	className,
	unselectedName = "Select...",
	name,
	description,
	noMarginBottom,
	inline = false,
}: {
	value: T;
	setValue: (value: T) => void;
	children: React.ReactNode;
	name?: string;
	allowNull?: boolean;
	style?: React.CSSProperties;
	className?: string;
	unselectedName?: string;
	description?: string;
	noMarginBottom?: boolean;
	inline?: boolean;
}) {
	return (
		<Form.Group
			style={{
				marginBottom: noMarginBottom ? "unset" : undefined,
				display: inline ? "inline" : undefined,
			}}
		>
			{name && <Form.Label>{name}</Form.Label>}
			<Form.Control
				style={{ width: "unset", display: "inline", ...style }}
				className={`mx-2 ${className}`}
				as="select"
				value={value ?? ""}
				onChange={(e) => setValue((e.target.value === "" ? null : e.target.value) as T)}
			>
				{allowNull && <option value="">{unselectedName}</option>}
				{children}
			</Form.Control>
			{description && <Form.Text className="text-muted">{description}</Form.Text>}
		</Form.Group>
	);
}
