import React, { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import Icon from "./Icon";

export default function EditableText({
	onChange,
	children,
	initial,
}: {
	onChange: (str: string) => void;
	children: (text: string) => React.ReactNode;
	initial: string;
}) {
	const [text, setText] = useState(initial);
	const [editing, setEditing] = useState(false);

	if (editing) {
		return (
			<InputGroup className="mb-2">
				<Form.Control value={text} onChange={(e) => setText(e.target.value)} />
				<Button
					variant="success"
					onClick={() => {
						setEditing(false);
						onChange(text);
					}}
				>
					Change
				</Button>
			</InputGroup>
		);
	}

	return (
		<div onClick={() => setEditing(true)} className="d-flex">
			<div>{children(text)}</div>
			<div>
				<Icon type="pencil" />
			</div>
		</div>
	);
}
