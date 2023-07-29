import React, { ElementType } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { SetState } from "types/react";

export default function FormInput({
	fieldName,
	value,
	setValue,
	placeholder,
	as,
	type,
}: {
	fieldName: string;
	value: string;
	setValue: SetState<string>;
	placeholder?: string;
	as?: ElementType;
	type?: string;
}) {
	return (
		<InputGroup>
			<InputGroup.Text>{fieldName}</InputGroup.Text>
			<Form.Control
				as={as}
				placeholder={placeholder}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				type={type}
			/>
		</InputGroup>
	);
}
