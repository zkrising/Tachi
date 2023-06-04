import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

const ActivitySkeleton = () => {
	function getRandomWidth() {
		const min = 38;
		const max = 64;

		const randomWidth = Math.floor(Math.random() * (max - min + 1) + min);

		return `${randomWidth}%`;
	}

	function Segment() {
		const width = getRandomWidth();

		return (
			<Row className="align-items-center justify-content-between user-select-none mx-2 my-4 p-1">
				<div className="timeline-dot skeleton align-self-center p-0" />
				<Col md={8} lg={10} className="py-4 d-flex fw-light h-100 align-items-center">
					{/*Mobile skeleton*/}
					<div className="d-flex d-md-none w-100">
						<div className="skeleton skeleton-pfp-small me-4" />
						<div className="d-flex flex-column w-100">
							<div className="skeleton skeleton-title mb-1 w-100" />
							<div className="skeleton skeleton-title" style={{ width }} />
						</div>
					</div>
					{/*Responsive width looks strange on the medium breakpoint we use a static width*/}
					<div className="d-none d-md-flex d-lg-none align-items-center w-100">
						<div className="skeleton skeleton-pfp-small me-4" />
						<div className="skeleton skeleton-title skeleton-title d-none d-md-block" />
					</div>
					{/*Large medium skeleton*/}
					<div className="d-none d-lg-flex align-items-center w-100">
						<div className="skeleton skeleton-pfp-small me-4" />
						<div
							className="skeleton skeleton-title skeleton-title d-none d-md-block"
							style={{ width }}
						/>
					</div>
				</Col>
				{/*Timestamp skeleton*/}
				<Col md={4} lg={2} className="d-flex flex-column align-items-end py-4">
					<div className="skeleton skeleton-time rounded rounded-1 mb-1" />
					<div className="skeleton skeleton-date rounded rounded-1" />
				</Col>
			</Row>
		);
	}

	function MultiplySegments({ repeat }: { repeat: number }) {
		const segments = [];

		for (let i = 0; i < repeat; i++) {
			segments.push(<Segment key={i} />);
		}

		return <>{segments}</>;
	}

	return (
		<div className="position-relative" id="activity-skeleton">
			<div className="timeline-bar skeleton my-4" />
			<MultiplySegments repeat={5} />
		</div>
	);
};

// Activity likes to rerender this at least once so memo once initialised
export default React.memo(ActivitySkeleton);
