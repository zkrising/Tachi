import React, { useState } from "react";
import { SetState } from "types/react";
import Icon from "./Icon";

export default function DebounceSearch({
	className,
	setSearch,
	placeholder,
	autoFocus = false,
}: {
	className?: string;
	setSearch: SetState<string>;
	placeholder: string;
	autoFocus?: boolean;
}) {
	const [lastTimeout, setLastTimeout] = useState<null | number>(null);
	const [uiSearch, setUISearch] = useState("");

	return (
		<div className="input-group">
			<input
				autoFocus={autoFocus}
				className={`form-control form-control-lg ${className ? { className } : ""}`}
				type="text"
				value={uiSearch}
				onChange={(e) => {
					setUISearch(e.target.value);

					if (lastTimeout !== null) {
						clearTimeout(lastTimeout);
					}

					const closureSearch = e.target.value;

					const handle = window.setTimeout(() => {
						setSearch(closureSearch);
					}, 300);

					setLastTimeout(handle);
				}}
				placeholder={placeholder}
			/>
			<button className="btn btn-primary">
				<Icon type="search" style={{ color: "#000" }} />
			</button>
		</div>
	);
}
