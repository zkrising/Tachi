import React, { useState } from "react";
import { SetState } from "types/react";

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
				className={`form-control ${className}`}
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
			<span className="input-group-text">
				<i className="fas fa-search"></i>
			</span>
		</div>
	);
}
