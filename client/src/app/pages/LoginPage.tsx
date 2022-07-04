import { APIFetchV1 } from "util/api";
import { HumaniseError } from "util/humanise-error";
import { HistorySafeGoBack } from "util/misc";
import useSetSubheader from "components/layout/header/useSetSubheader";
import CenterPage from "components/util/CenterPage";
import SiteWordmark from "components/util/SiteWordmark";
import { UserContext } from "context/UserContext";
import { useFormik } from "formik";
import React, { useContext, useState } from "react";
import { Button, Col, Form } from "react-bootstrap";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import { Link, useHistory } from "react-router-dom";
import { PublicUserDocument } from "tachi-common";

export default function LoginPage() {
	useSetSubheader("Login");

	const [err, setErr] = useState("");
	const { setUser } = useContext(UserContext);
	const history = useHistory();

	const formik = useFormik({
		initialValues: {
			username: "",
			"!password": "",
			captcha: "",
		},
		onSubmit: async values => {
			setErr("");

			const rj = await APIFetchV1(
				"/auth/login",
				{
					method: "POST",
					body: JSON.stringify(values),
					headers: {
						"Content-Type": "application/json",
					},
				},
				false,
				false
			);

			if (!rj.success) {
				setErr(HumaniseError(rj.description));
				return;
			}

			const userRJ = await APIFetchV1<PublicUserDocument>("/users/me");

			if (userRJ.statusCode === 403) {
				setErr("You are banned.");
				return;
			}

			if (!userRJ.success) {
				console.error("Error retrieving own user?");
				setErr("An internal server error has occured.");
				return;
			}

			toast.success("Logged in!");

			setTimeout(() => {
				setUser(userRJ.body);
				localStorage.setItem("isLoggedIn", "true");

				HistorySafeGoBack(history);
			}, 500);
		},
	});

	return (
		<CenterPage>
			<Col lg="6">
				<SiteWordmark />
				<div className="text-center mb-10 mb-lg-20">
					<h3 className="font-size-h1">Log In</h3>
					<span className="font-weight-bold text-dark-50">Don't have an account?</span>
					<Link to="/register" className="font-weight-bold ml-2">
						Sign Up!
					</Link>
				</div>
				<Form onSubmit={formik.handleSubmit}>
					<Form.Group>
						<Form.Label>Username</Form.Label>
						<Form.Control
							tabIndex={1}
							type="text"
							id="username"
							value={formik.values.username}
							onChange={formik.handleChange}
						/>
					</Form.Group>
					<Form.Group>
						<Form.Label>Password</Form.Label>
						<Form.Control
							tabIndex={2}
							type="password"
							id="!password"
							value={formik.values["!password"]}
							onChange={formik.handleChange}
						/>
					</Form.Group>
					<Form.Group
						style={{ display: err ? "" : "none" }}
						className="text-center text-danger"
					>
						{err}
					</Form.Group>

					<ReCAPTCHA
						sitekey={
							process.env.REACT_APP_RECAPTCHA_KEY ??
							"6LdI2swUAAAAAArkM0ZQi4SnttilqgAwsJSFw3PX"
						}
						onChange={v => {
							formik.setFieldValue("captcha", v);
						}}
					/>

					<Form.Group className="justify-content-center d-flex pt-4">
						<span
							onClick={() => history.goBack()}
							tabIndex={4}
							className="mr-auto btn btn-outline-danger"
						>
							Back
						</span>
						<Link to="/forgot-password">Forgot Password</Link>
						<Button tabIndex={3} type="submit" className="ml-auto">
							Log In
						</Button>
					</Form.Group>
				</Form>
			</Col>
		</CenterPage>
	);
}
