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
	name,
	description,
}: {
	value: T;
	setValue: SetState<T>;
	children: React.ReactNode;
	name: string;
	allowNull?: boolean;
	style?: React.CSSProperties;
	className?: string;
	unselectedName?: string;
	description?: string;
}) {
	return (
		<Form.Group>
			<Form.Label>{name}</Form.Label>
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
			{description && (
				<Form.Text className="text-muted">
					This configures the default rating algorithm to display for scores. This is used
					for things like score tables and PB tables.
				</Form.Text>
			)}
		</Form.Group>
	);
}
