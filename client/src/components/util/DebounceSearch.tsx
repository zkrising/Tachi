import React, { useState } from "react";
import { SetState } from "types/react";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { FormControlProps } from "react-bootstrap";
import Icon from "./Icon";

export default function DebounceSearch({
	setSearch,
	autoFocus = false,
	...props
}: {
	setSearch: SetState<string>;
	autoFocus?: boolean;
} & FormControlProps) {
	const [lastTimeout, setLastTimeout] = useState<null | number>(null);
	const [uiSearch, setUISearch] = useState("");

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUISearch(e.target.value);

		if (lastTimeout !== null) {
			clearTimeout(lastTimeout);
		}

		const closureSearch = e.target.value;

		const handle = window.setTimeout(() => {
			setSearch(closureSearch);
		}, 300);

		setLastTimeout(handle);
	};

	return (
		<InputGroup size="lg">
			<Form.Control
				type="text"
				value={uiSearch}
				onChange={handleChange}
				autoFocus={autoFocus}
				{...props}
			/>
			<InputGroup.Text>
				<Icon type="search" />
			</InputGroup.Text>
		</InputGroup>
	);
}
