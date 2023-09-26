// These types are more comprehensive than those included with react-bootstrap
export type TextColour =
	| "primary"
	| "primary-emphasis"
	| "secondary"
	| "secondary-emphasis"
	| "success"
	| "success-emphasis"
	| "danger"
	| "danger-emphasis"
	| "warning"
	| "warning-emphasis"
	| "info"
	| "info-emphasis"
	| "light"
	| "light-emphasis"
	| "dark"
	| "dark-emphasis"
	| "body"
	| "body-secondary"
	| "body-tertiary"
	| "black"
	| "white";

export type Colour =
	| "primary"
	| "primary-subtle"
	| "secondary"
	| "secondary-subtle"
	| "success"
	| "success-subtle"
	| "danger"
	| "danger-subtle"
	| "warning"
	| "warning-subtle"
	| "info"
	| "info-subtle"
	| "light"
	| "light-subtle"
	| "dark"
	| "dark-subtle"
	| "body"
	| "body-secondary"
	| "body-tertiary"
	| "black"
	| "white";

// LinkContainer doesn't export its prop types
export interface LinkContainerProps {
	children: React.ReactNode;
	onClick?: React.MouseEventHandler<HTMLElement>;
	replace?: boolean;
	to: string | { pathname: string };
	state?: object;
	className?: string;
	activeClassName?: string;
	style?: React.CSSProperties;
	activeStyle?: React.CSSProperties;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	isActive?: ((match: any, location: any) => boolean) | boolean;
}
