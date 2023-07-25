import React from "react";
import DropdownNavLink from "components/ui/DropdownNavLink";
import QuickDropdown from "components/ui/QuickDropdown";

const UtilsLinks = () => (
	<>
		<DropdownNavLink to="/utils/seeds">Seeds Management</DropdownNavLink>
		<DropdownNavLink to="/utils/imports">Import Management</DropdownNavLink>
		<DropdownNavLink to="/utils/quests">Quest Creator</DropdownNavLink>
	</>
);

export default function UtilsDropdown({
	className,
	style,
}: {
	className?: string;
	style?: React.CSSProperties;
}) {
	return (
		<QuickDropdown
			variant="clear"
			toggle="Developer Utils"
			className={`h-14 ${className}`}
			menuStyle={style}
			caret
		>
			<UtilsLinks />
		</QuickDropdown>
	);
}
