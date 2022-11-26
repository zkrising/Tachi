import React from "react";
import { SetState } from "types/react";

export default function BigSearch({
	className,
	search,
	setSearch,
	placeholder,
}: {
	className?: string;
	search: string;
	setSearch: SetState<string>;
	placeholder: string;
}) {
	return (
		<div className="input-group">
			<input
				className={`form-control ${className}`}
				type="text"
				value={search}
				onChange={(e) => {
					setSearch(e.target.value);
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
