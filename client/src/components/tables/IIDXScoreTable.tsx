import React from "react";

export default function IIDXScoreTable() {
	return (
		<div
			className="datatable datatable-bordered datatable-head-custom datatable-default datatable-primary datatable-subtable datatable-loaded w-100"
			id="kt_datatable"
		>
			<table className="datatable-table d-block">
				<thead className="datatable-head">
					<tr className="datatable-row">
						<th
							data-field="RecordID"
							className="datatable-cell-center datatable-cell datatable-cell-sort"
						>
							<span></span>
						</th>
						<th data-field="FirstName" className="datatable-cell datatable-cell-sort">
							<span>First Name</span>
						</th>
						<th data-field="LastName" className="datatable-cell datatable-cell-sort">
							<span>Last Name</span>
						</th>
						<th data-field="Company" className="datatable-cell datatable-cell-sort">
							<span>Company</span>
						</th>
						<th data-field="Email" className="datatable-cell datatable-cell-sort">
							<span>Email</span>
						</th>
						<th data-field="Status" className="datatable-cell datatable-cell-sort">
							<span>Status</span>
						</th>
					</tr>
				</thead>
				<tbody className="datatable-body">
					<tr data-row="0" className="datatable-row datatable-row-even">
						<td
							className="datatable-cell-sorted datatable-cell-center datatable-cell"
							data-field="RecordID"
							aria-label="1"
						>
							<a
								className="datatable-toggle-subtable"
								href="#"
								data-value="1"
								title="Load sub table"
							>
								<i></i>
							</a>
						</td>
						<td data-field="FirstName" aria-label="Tommie" className="datatable-cell">
							<span>Tommie</span>
						</td>
						<td data-field="LastName" aria-label="Pee" className="datatable-cell">
							<span>Pee</span>
						</td>
						<td
							data-field="Email"
							aria-label="tpee0@slashdot.org"
							className="datatable-cell"
						>
							<span>tpee0@slashdot.org</span>
						</td>
						<td data-field="Status" aria-label="4" className="datatable-cell">
							<span>
								<span className="label  label-success label-inline label-pill">
									Success
								</span>
							</span>
						</td>
						<td
							data-field="Type"
							data-autohide-disabled="false"
							aria-label="1"
							className="datatable-cell"
						>
							<span>
								<span className="label label-danger label-dot"></span>&nbsp;
								<span className="font-weight-bold text-danger">Online</span>
							</span>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
