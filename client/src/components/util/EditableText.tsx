import React, { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import Icon from "./Icon";

export default function EditableText({
	as = "p",
	onEdit,
	initial,
	authorised,
	...props
}: {
	as?: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span";
	onEdit: (value: string) => void;
	initial: string;
	authorised: boolean;
} & React.HTMLAttributes<HTMLElement>) {
	const [text, setText] = useState(initial);
	const [editing, setEditing] = useState(false);

	if (editing) {
		return (
			<InputGroup>
				<Form.Control value={text} onChange={(e) => setText(e.target.value)} />
				<Button
					variant="success"
					type="submit"
					onClick={() => {
						setEditing(false);
						onEdit(text);
					}}
				>
					Change
				</Button>
			</InputGroup>
		);
	}

	return (
		<div
			onClick={() => authorised && setEditing(true)}
			className={`d-flex gap-2 ${authorised ? "cursor-pointer" : ""}`}
		>
			{React.createElement(as, { ...props }, text)}
			{authorised && <Icon type="pencil-alt" />}
		</div>
	);
}
