import React from "react";
import Badge from "react-bootstrap/Badge";
import Col from "react-bootstrap/Col";

function Skeleton({ width }: { width?: string }) {
	return <div className="skeleton rounded-1" style={{ height: "1em", width }} />;
}

function BadgeSkeleton() {
	return (
		<Badge bg="secondary" className="skeleton me-2 mt-2 mb-lg-0">
			<div style={{ width: "4.5em", height: "1em" }} />
		</Badge>
	);
}

function RatingSkeleton() {
	return (
		<>
			<Col
				xs={5}
				lg="auto"
				className="d-flex me-2 me-lg-4 mb-lg-1 p-0 text-lg-end align-self-lg-end justify-content-start justify-content-lg-end align-items-start align-items-lg-end"
			>
				<BadgeSkeleton />
			</Col>
			<Col
				xs="auto"
				className="d-flex flex-column justify-content-end align-items-end ms-auto p-0 mt-lg-0 mb-lg-n2"
			>
				<div className="skeleton rounded display-3 enable-rfs mb-1 mt-1 mt-lg-1 mb-lg-3">
					<div style={{ width: "5em", height: "1em" }} />
				</div>
			</Col>
		</>
	);
}

function InfoSkeleton() {
	return (
		<>
			<h3 className="mb-1 mt-1 mt-lg-0h">
				<Skeleton width="2em" />
			</h3>
			<small className="mt-1 mb-lg-2 flex-grow-1 flex-lg-grow-0">
				<Skeleton width="6em" />
			</small>
			<div className="mb-1 mb-lg-0 mt-lg-1 pt-lg-0h flex-lg-grow-1">
				<small>
					<Skeleton width="12em" />
				</small>
			</div>
		</>
	);
}

Skeleton.Info = InfoSkeleton;
Skeleton.Rating = RatingSkeleton;

export default Skeleton;
