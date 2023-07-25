import React from "react";
import { LinkContainer } from "react-router-bootstrap";
import Button, { ButtonProps } from "react-bootstrap/Button";
import { LinkContainerProps } from "types/bootstrap";

/**A Bootstrap Button component that acts like a react-router Link */
export default function LinkButton({
	to,
	activeClassName,
	activeStyle,
	isActive,
	replace,
	state,
	children,
	style,
	className,
	...props
}: LinkContainerProps & ButtonProps) {
	return (
		<LinkContainer
			to={to}
			activeClassName={activeClassName}
			activeStyle={activeStyle}
			replace={replace}
			state={state}
			isActive={isActive}
			style={style}
			className={className}
		>
			<Button {...props}>{children}</Button>
		</LinkContainer>
	);
}
