import React from "react";
import { Form } from "react-bootstrap";
import { JustChildren } from "types/react";

export default function CheckEdit<T extends string>({
	currentType,
	type,
	onChange,
	children,
}: { type: T; currentType: T; onChange: () => void } & JustChildren) {
	return (
		<div
			className={`my-4 ${currentType !== type ? "text-muted" : ""}`}
			style={{ fontWeight: currentType === type ? "bold" : "" }}
		>
			<Form.Check
				type="radio"
				style={{ display: "inline" }}
				className="mr-4"
				checked={currentType === type}
				onChange={onChange}
			/>{" "}
			{children}
		</div>
	);
}
