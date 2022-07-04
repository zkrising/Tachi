import { GetValueGetter, ValueGetterOrHybrid } from "util/ztable/search";
import Divider from "components/util/Divider";
import ExternalLink from "components/util/ExternalLink";
import HoverText from "components/util/HoverText";
import SmallText from "components/util/SmallText";
import StickyPopover from "components/util/StickyPopover";
import { nanoid } from "nanoid";
import React, { useState } from "react";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";

function AdditionalTableProps({
	value,
}: {
	value: string | number | [string, number] | boolean | null;
}) {
	let typeName;

	if (Array.isArray(value)) {
		typeName = "Hybrid";
	} else if (typeof value === "string") {
		typeName = "Text";
	} else if (value === null) {
		typeName = "Cannot Infer :(";
	} else if (typeof value === "boolean") {
		typeName = "Presence";
	} else {
		typeName = "Number";
	}

	return (
		<>
			<td>{typeName}</td>
			<td>
				{typeof value === "boolean"
					? "Yes/No/True/False"
					: Array.isArray(value)
					? `${value[0]} (${value[1]})`
					: value}
			</td>
		</>
	);
}

export default function FilterDirectivesIndicator<D>({
	searchFunctions,
	doc,
}: {
	searchFunctions: Record<string, ValueGetterOrHybrid<D>>;
	doc?: D;
}) {
	const [modalShow, setModalShow] = useState(false);

	return (
		<>
			<StickyPopover
				placement="top"
				component={
					<>
						You can use{" "}
						<ExternalLink href="https://tachi.readthedocs.io/en/latest/user/filter-directives/">
							<strong>Filter Directives</strong>
						</ExternalLink>{" "}
						inside this filter box.
						<Divider className="mt-2 mb-2" />
						You can click this button to view the filter directives for this table.
					</>
				}
			>
				<div className="input-group-append" onClick={() => setModalShow(true)}>
					<small className="input-group-text">
						<i className="fas fa-bolt" style={{ fontSize: "0.8rem" }} />
					</small>
				</div>
			</StickyPopover>
			<Modal show={modalShow} onHide={() => setModalShow(false)} size="xl">
				<Modal.Header closeButton>
					<Modal.Title>Available Directives</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>
						This is a slightly advanced feature for{" "}
						<HoverText hover="nerds">power users</HoverText>. You can read about it{" "}
						<a href="https://tachi.readthedocs.io/en/latest/user/filter-directives/">
							here
						</a>
						.<br />
						The quick explanation is that you can use directives like{" "}
						<code>Title:conflict Score:&gt;=100</code> to perform advanced filters!
					</p>
					<Divider className="mb-4" />

					{doc ? (
						<table className="table table-striped table-hover text-center">
							<thead>
								<tr>
									<th>Key</th>
									<OverlayTrigger
										overlay={
											<Tooltip className="tooltip tooltip-wide" id={nanoid()}>
												<table className="table table-sm table-striped table-hover">
													<thead>
														<tr>
															<th>Type</th>
															<th>Description</th>
														</tr>
													</thead>
													<tbody>
														<tr>
															<td>
																<strong>Text</strong>
															</td>
															<td>
																Works like text. <code>&gt;</code>{" "}
																and similar operators compare
																alphabetically.
															</td>
														</tr>
														<tr>
															<td>
																<strong>Number</strong>
															</td>
															<td>Works like a number.</td>
														</tr>
														<tr>
															<td>
																<strong>Hybrid</strong>
															</td>
															<td>
																Although displayed as a string, and
																works like a string,{" "}
																<code>&gt;</code> and similar
																operators compare numerically on a
																hidden number. This is so things
																like <code>grade:&gt;AAA</code>
																get all the grades better than AAA,
																instead of alphabeticalising.
															</td>
														</tr>
													</tbody>
												</table>
											</Tooltip>
										}
										placement="right"
									>
										<th>Data Type</th>
									</OverlayTrigger>
									<th>Example Data</th>
								</tr>
							</thead>
							<tbody>
								{Object.keys(searchFunctions).map(key => (
									<tr key={key}>
										<td>
											<strong>
												{key[0].toUpperCase()}
												{key.substring(1)}
											</strong>
										</td>
										<AdditionalTableProps
											value={GetValueGetter(searchFunctions[key])(doc)}
										/>
									</tr>
								))}
							</tbody>
						</table>
					) : (
						<span className="text-center">
							Looks like this table has no data. We can't show anything about the
							directives.
						</span>
					)}
					<span>
						<small className="text-muted">
							You can <SmallText small="tap" large="click" /> anywhere off this dialog
							to close it.
						</small>
					</span>
				</Modal.Body>
			</Modal>
		</>
	);
}
