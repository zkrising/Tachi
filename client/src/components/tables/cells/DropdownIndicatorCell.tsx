import Icon from "components/util/Icon";
import React from "react";

export default function DropdownIndicatorCell() {
	return (
		<td style={{ minWidth: "20px", maxWidth: "40px" }}>
			<Icon type="angle-down" />
		</td>
	);
}
