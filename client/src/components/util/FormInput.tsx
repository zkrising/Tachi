import React from "react";
import { Form, FormControlProps, InputGroup } from "react-bootstrap";
import { SetState } from "types/react";

export default function FormInput({
	fieldName,
	setValue,
	...props
}: {
	fieldName: string;
	setValue: SetState<string>;
} & FormControlProps) {
	return (
		<InputGroup>
			<InputGroup.Text>{fieldName}</InputGroup.Text>
			<Form.Control onChange={(e) => setValue(e.target.value)} {...props} />
		</InputGroup>
	);
}
