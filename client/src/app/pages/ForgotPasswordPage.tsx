import CenterPage from "components/util/CenterPage";
import SiteWordmark from "components/util/SiteWordmark";
import { Form, Col, Button } from "react-bootstrap";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const history = useHistory();

	return (
		<CenterPage>
			<Col lg="6">
				<SiteWordmark />
				<div className="text-center mb-10 mb-lg-20">
					<h3 className="font-size-h1">Forgot Password</h3>
					<span className="font-weight-bold text-dark-50">
						Hey, it happens to all of us.
					</span>
				</div>
				<Form>
					<Form.Group>
						<Form.Label>Email Address</Form.Label>
						<Form.Control
							type="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
						/>
					</Form.Group>
					<Form.Group className="justify-content-center d-flex pt-4">
						<span
							onClick={() => history.goBack()}
							tabIndex={4}
							className="mr-auto btn btn-outline-danger"
						>
							Back
						</span>
						<Button tabIndex={3} type="submit" className="ml-auto">
							Send Reset Link
						</Button>
					</Form.Group>
				</Form>
				<Link to="/screwed">
					I signed up with a fake email, how can I recover my account?
				</Link>
			</Col>
		</CenterPage>
	);
}
