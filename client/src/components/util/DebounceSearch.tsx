import React, { useState } from "react";
import { SetState } from "types/react";

export default function DebounceSearch({
	className,
	setSearch,
	placeholder,
}: {
	className?: string;
	setSearch: SetState<string>;
	placeholder: string;
}) {
	const [lastTimeout, setLastTimeout] = useState<null | number>(null);
	const [uiSearch, setUISearch] = useState("");

	return (
		<div className="input-group">
			<input
				className={`form-control ${className}`}
				type="text"
				value={uiSearch}
				onChange={e => {
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
			<div className="input-group-append">
				<span className="input-group-text">
					<i className="fas fa-search"></i>
				</span>
			</div>
		</div>
	);
}
