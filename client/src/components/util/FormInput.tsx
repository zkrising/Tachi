import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import { SetState } from "types/react";

export default function FormInput({
	fieldName,
	value,
	setValue,
	placeholder,
}: {
	fieldName: string;
	value: string;
	setValue: SetState<string>;
	placeholder?: string;
}) {
	return (
		<InputGroup>
			<InputGroup.Append>
				<InputGroup.Text>{fieldName}</InputGroup.Text>
			</InputGroup.Append>
			<Form.Control
				placeholder={placeholder}
				value={value}
				onChange={e => setValue(e.target.value)}
			/>
		</InputGroup>
	);
}
