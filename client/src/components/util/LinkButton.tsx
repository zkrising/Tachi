import React from "react";
import Button, { ButtonProps } from "react-bootstrap/Button";
import { useHistory } from "react-router-dom";

interface LinkButtonProps extends ButtonProps {
	to: string;
	children?: React.ReactNode;
}

/**Use as a react-bootstrap \<Button\> and pass a path (to) to navigate to with useHistory*/
export default function LinkButton({ to, children, ...props }: LinkButtonProps) {
	const history = useHistory();
	function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
		if (
			// Allow link to work normally under these conditions
			!e.defaultPrevented &&
			e.button === 0 &&
			(!props.target || props.target === "_self") &&
			!isModified(e)
		) {
			// Conditions above are satisfied, navigate to path programatically
			e.preventDefault();
			history.push(to);
		}
	}

	function isModified(e: React.MouseEvent<HTMLButtonElement>) {
		return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
	}

	return (
		<Button as="a" href={to} onClick={(e) => handleClick(e)} {...props}>
			{children}
		</Button>
	);
}
