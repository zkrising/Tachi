import Icon from "components/util/Icon";
import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

interface NavbarProps {
	children: React.ReactNode;
}

interface NavItemProps {
	to: string;
	key?: string;
	otherMatchingPaths?: string[];
	children: React.ReactNode;
	active?: boolean;
	setActiveItem?: (ref: HTMLElement | Record<string, never>) => void;
}

const Navbar = ({ children }: NavbarProps) => {
	const [activeItem, setActiveItem] = useState<HTMLElement | Record<string, never>>({});
	const parentRef = useRef<HTMLDivElement>(null);
	const loc = useLocation();
	const [indicatorPos, setIndicatorPos] = useState({});
	const [showScrollLeft, setShowScrollLeft] = useState(false);
	const [showScrollRight, setShowScrollRight] = useState(false);

	// If the page changes size or the container scrolls, we need to refresh the indicator's position and the scroll buttons,
	// so we observe the container and add a scroll event listener
	useEffect(() => {
		handlePosChange();
		handleScrollButtonVisibility();

		const resizeObserver = new ResizeObserver(() => {
			handlePosChange();
			handleScrollButtonVisibility();
		});
		resizeObserver.observe(parentRef.current as HTMLElement);

		const container = parentRef.current;
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
	// The logic to set the position of the indicator
	function handlePosChange() {
		const { offsetLeft, offsetWidth } = activeItem;
		const containerOffsetLeft = parentRef.current?.offsetLeft || 0;
		setIndicatorPos({
			left: offsetLeft - containerOffsetLeft,
			width: offsetWidth,
		});
	}
	{
		// Set when scroll buttons show based on the scroll position, if any
	}
	function handleScrollButtonVisibility() {
		const container = parentRef.current;
		if (container) {
			setShowScrollLeft(container.scrollLeft > 0);
			setShowScrollRight(
				container.scrollLeft < container.scrollWidth - container.clientWidth
			);
		}
	}
	{
		// Scroll button functions
	}
	function handleScrollLeft() {
		const container = parentRef.current;
		container?.scrollBy({ left: -container.clientWidth * 0.75, behavior: "smooth" });
	}
	function handleScrollRight() {
		const container = parentRef.current;
		container?.scrollBy({ left: container.clientWidth * 0.75, behavior: "smooth" });
	}
	return (
		<div className="tachi-navbar-container rounded position-relative">
			<div
				className="tachi-navbar-container-inner rounded overflow-auto mx-0h"
				ref={parentRef}
			>
				{/* The navbar sits inside a container so it can overflow when the navbar is too large */}
				<div className="tachi-navbar rounded d-flex justify-content-evenly position-relative w-100 text-uppercase">
					{React.Children.toArray(children).map((child) => {
						if (React.isValidElement<NavItemProps>(child)) {
							const to: string = child.props.to.replace(/\/?$/u, "/"); // Homepage link is 'to="/"' which is fine but this causes an issue with setting the navItem active so... we ignore it.
							const otherMatchingPaths = Array.isArray(child.props.otherMatchingPaths)
								? child.props.otherMatchingPaths.map((p) => p)
								: [];
							const pathname = loc.pathname.replace(/\/?$/u, "/"); // get pathname from router-dom and remove any trailing slash
							let isActive = false;
							if (to === "/") {
								isActive = pathname === "/";
							} else {
								isActive =
									pathname.startsWith(to) ||
									otherMatchingPaths.some((p) => pathname.startsWith(p));
							}
							return React.cloneElement<NavItemProps>(child, {
								active: isActive,
								setActiveItem,
							});
						}
						return child;
					})}
					<div
						className="tachi-indicator bg-primary rounded pe-none"
						style={{
							...indicatorPos,
							position: "absolute", // set absolute here because it's necessary
						}}
					/>
				</div>
			</div>
			{/* The buttons use transitions based on the show selector. The behaviour I chose is to adjust the width of the buttons between 0 and 2rem.
			There is also a gradient background so there's a nice transition between the elements under and the opaque background of the button 
			The arrows use a simple opacity transition with a longer duration than the buttons' so the arrow doesn't pop in before it has a background */}
			<div
				className={`tachi-scroll tachi-scroll-left position-absolute start-0 top-0 h-100 ${
					showScrollLeft ? "show" : ""
				}`}
				onClick={handleScrollLeft}
			>
				<Icon type="chevron-left" className="d-flex w-100 h-100 align-items-center" />
			</div>
			<div
				className={`tachi-scroll tachi-scroll-right position-absolute end-0 top-0 h-100 ${
					showScrollRight ? "show" : ""
				}`}
				onClick={handleScrollRight}
			>
				<Icon type="chevron-right" className="d-flex w-100 h-100 align-items-center" />
			</div>
		</div>
	);
};

const Item = ({ to, key, children, setActiveItem, active }: NavItemProps) => {
	const linkRef = useRef<HTMLAnchorElement>(null);
	// If a link is active, update its parent's active state
	useEffect(() => {
		if (linkRef.current && active && setActiveItem) {
			setActiveItem(linkRef.current);
		}
	}, [linkRef, active, setActiveItem]);

	return (
		<NavLink
			className="tachi-item gentle-link mx-2"
			key={key}
			to={to}
			exact
			ref={linkRef}
			draggable={false}
		>
			<div className="tachi-link px-8 my-5">{children}</div>
		</NavLink>
	);
};

Navbar.Item = Item;

export default Navbar;
