/* eslint-disable react/prop-types */
import React, { forwardRef } from "react";

// todo: understand this file - it was leveraged from metronic and uses something weird.
// it exists because we need to override reactbootstraps default of adding btn btn-primary to dropdowns

const DropdownTopbarItemToggler = forwardRef((props, ref) => (
	<div
		// @ts-expect-error see todo
		ref={ref}
		className="topbar-item"
		onClick={e => {
			e.preventDefault();
			// @ts-expect-error see todo
			props.onClick(e);
		}}
	>
		{props.children}
	</div>
));

DropdownTopbarItemToggler.displayName = "DropdownTopbarItemToggler";

export default DropdownTopbarItemToggler;
