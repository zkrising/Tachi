import Icon from "components/util/Icon";
import LinkButton from "components/util/LinkButton";
import React from "react";

export function SearchButton() {
	return (
		<LinkButton
			variant="clear"
			to="/search"
			aria-label="Search"
			className="h-14 w-14 px-4 d-flex align-items-center display-6 text-body-secondary"
		>
			<Icon type="search" />
		</LinkButton>
	);
}
