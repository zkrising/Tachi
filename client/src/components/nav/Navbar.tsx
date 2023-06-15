import Icon from "components/util/Icon";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

interface NavbarProps {
	children: React.ReactNode;
}

interface NavItemProps {
	to: string;
	otherMatchingPaths?: string[];
	children: React.ReactNode;
	active?: boolean;
	setActiveItem?: (ref: HTMLElement) => void;
}

function Navbar({ children }: NavbarProps): JSX.Element {
	const [activeItem, setActiveItem] = useState<HTMLElement | Record<string, never>>({});
	const parentRef = useRef<HTMLDivElement>(null);
	const loc = useLocation();
	const [indicatorPos, setIndicatorPos] = useState<CSSProperties>({});
	const [showScrollLeft, setShowScrollLeft] = useState(false);
	const [showScrollRight, setShowScrollRight] = useState(false);

	function handleScrollLeft() {
		const container = parentRef.current;
		const clientWidth = parentRef.current?.clientWidth || 0;
		if (container) {
			container.scrollBy({
				left: -clientWidth * 0.75,
				behavior: "smooth",
			});
		}
	}
	function handleScrollRight() {
		const container = parentRef.current;
		const clientWidth = parentRef.current?.clientWidth || 0;
		if (container) {
			container.scrollBy({
				left: clientWidth * 0.75,
				behavior: "smooth",
			});
		}
	}

	useEffect(() => {
		const container = parentRef.current;

		function handlePosChange() {
			const { offsetLeft, offsetWidth } = activeItem;
			const containerOffsetLeft = parentRef.current?.offsetLeft;
			const realOffset = offsetLeft - (containerOffsetLeft || 0);
			if (realOffset) {
				setIndicatorPos({
					left: realOffset,
					width: offsetWidth,
				});
			}
		}
		// Update the indicator whenever a resize happens
		const resizeObserver = new ResizeObserver(() => {
			handlePosChange();
			handleScrollButtonVisibility();
		});
		resizeObserver.observe(parentRef.current as HTMLElement);

		// Check the scroll position to determine which buttons display
		function handleScrollButtonVisibility() {
			if (container) {
				setShowScrollLeft(container.scrollLeft > 0);
				setShowScrollRight(
					container.scrollLeft < container.scrollWidth - container.clientWidth
				);
			}
		}

		if (container) {
			container.addEventListener("scroll", handleScrollButtonVisibility);
		}

		return () => {
			resizeObserver.disconnect();
			if (container) {
				container.removeEventListener("scroll", handleScrollButtonVisibility);
			}
		};
	}, [activeItem, parentRef]);

	return (
		<div className="rounded position-relative user-select-none">
			<div
				className="hide-scrollbar rounded overflow-auto mx-0h"
				ref={parentRef}
				tabIndex={-1}
			>
				{/* The navbar sits inside a container so it can overflow when the navbar is too large */}
				<div className="small min-w-max rounded d-flex justify-content-evenly position-relative w-100 text-uppercase">
					{React.Children.toArray(children).map((child) => {
						if (React.isValidElement<NavItemProps>(child)) {
							const { to } = child.props;
							const otherMatchingPaths = Array.isArray(child.props.otherMatchingPaths)
								? child.props.otherMatchingPaths.map((p) => p)
								: [];
							const pathname = loc.pathname;
							if (pathname.startsWith(to)) {
								return React.cloneElement<NavItemProps>(child, {
									active: true,
									setActiveItem,
								});
							} else if (otherMatchingPaths.some((p) => pathname.startsWith(p))) {
								return React.cloneElement<NavItemProps>(child, {
									active: true,
									setActiveItem,
								});
							}
						}
						return child;
					})}
					{indicatorPos.width !== 0 && (
						<div
							className="navbar-indicator bg-primary rounded"
							style={{
								...indicatorPos,
								position: "absolute", // set absolute here because it's necessary
							}}
						/>
					)}
				</div>
			</div>
			<div
				className={`navbar-scroll navbar-scroll-left position-absolute start-0 top-0 h-100 ${
					showScrollLeft ? "show" : ""
				}`}
				onClick={handleScrollLeft}
			>
				<Icon type="chevron-left" className="d-flex w-100 h-100 align-items-center" />
			</div>
			<div
				className={`navbar-scroll navbar-scroll-right position-absolute end-0 top-0 h-100 ${
					showScrollRight ? "show" : ""
				}`}
				onClick={handleScrollRight}
			>
				<Icon type="chevron-right" className="d-flex w-100 h-100 align-items-center" />
			</div>
		</div>
	);
}

function Item({ to, children, setActiveItem, active }: NavItemProps) {
	const linkRef = useRef<HTMLAnchorElement>(null);
	useEffect(() => {
		if (linkRef.current && active && setActiveItem) {
			setActiveItem(linkRef.current);
		}
	});

	return (
		<NavLink
			className="px-8 mx-2 py-4 feature-nav"
			to={to}
			exact
			ref={linkRef}
			draggable={false}
		>
			{children}
		</NavLink>
	);
}

Navbar.Item = Item;

export default Navbar;
