import CenterPage from "components/util/CenterPage";
import SiteWordmark from "components/util/SiteWordmark";
import { Form, Col, Button } from "react-bootstrap";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { APIFetchV1 } from "util/api";
import MainPageTitleContainer from "components/util/MainPageTitleContainer";
import { HistorySafeGoBack } from "util/misc";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const history = useHistory();
	const [hasResetPassword, setHasResetPassword] = useState(false);

	return (
		<CenterPage>
			<Col lg="6">
				<MainPageTitleContainer
					title="Forgot Password"
					desc="Hey, it happens to all of us :P"
				/>
				{hasResetPassword ? (
					<div>
						All good! An email has been sent to {email} IF an account exists with that
						email.
						<br />
						<Link to="/">Go home.</Link>
					</div>
				) : (
					<>
						<Form
							onSubmit={async e => {
								e.preventDefault();

								const res = await APIFetchV1(
									"/auth/forgot-password",
									{
										method: "POST",
										headers: {
											"Content-Type": "application/json",
										},
										body: JSON.stringify({ email }),
									},
									true,
									true
								);

								if (res.success) {
									setTimeout(() => setHasResetPassword(true), 300);
								}
							}}
						>
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
									onClick={() => HistorySafeGoBack(history)}
									tabIndex={4}
									className="mr-auto btn btn-outline-danger"
								>
									Back
								</span>
								<Button
									tabIndex={3}
									type="submit"
									className="ml-auto"
									disabled={email === ""}
								>
									Send Reset Link
								</Button>
							</Form.Group>
						</Form>
						<Link to="/screwed">
							I signed up with a fake email, how can I recover my account?
						</Link>
					</>
				)}
			</Col>
		</CenterPage>
	);
}
