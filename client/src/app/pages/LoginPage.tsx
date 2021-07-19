import React, { useContext, useState } from "react";
import { Button, Col, Form } from "react-bootstrap";
import { toAbsoluteUrl } from "_metronic/_helpers";
import { useFormik } from "formik";
import { APIFetchV1 } from "util/api";
import { HumaniseError } from "util/humanise-error";
import { Link, useHistory } from "react-router-dom";
import { UserContext } from "context/UserContext";
import { PublicUserDocument } from "tachi-common";
import toast from "react-hot-toast";
import { TachiConfig } from "lib/config";

export default function LoginPage() {
	const [err, setErr] = useState("");
	const { setUser } = useContext(UserContext);
	const history = useHistory();

	const formik = useFormik({
		initialValues: {
			username: "",
			password: "",
			captcha: "temp",
		},
		onSubmit: async values => {
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

			if (!userRJ.success) {
				console.error("Error retrieving own user?");
				setErr("An internal server error has occured.");
				return;
			}

			toast.success("Logged in!");

			setTimeout(() => {
				setUser(userRJ.body);

				history.goBack();
			}, 500);
		},
	});

	return (
		<div className="container d-flex flex-column flex-root justify-content-center align-items-center">
			<Col lg="6">
				<div className="text-center mb-10 mb-lg-10">
					<img
						src={toAbsoluteUrl("/media/logos/logo-wordmark.png")}
						alt={TachiConfig.name}
						width="256px"
					/>
				</div>
				<div className="text-center mb-10 mb-lg-20">
					<h3 className="font-size-h1">Log In</h3>
					<span className="font-weight-bold text-dark-50">
						Don&apos;t have an account?
					</span>
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
							id="password"
							value={formik.values.password}
							onChange={formik.handleChange}
						/>
					</Form.Group>
					<Form.Group
						style={{ display: err ? "" : "none" }}
						className="text-center text-danger"
					>
						{err}
					</Form.Group>
					<Form.Group className="justify-content-center d-flex pt-4">
						<Link to="/" tabIndex={4} className="mr-auto btn btn-outline-danger">
							Back
						</Link>
						<Button tabIndex={3} type="submit" className="ml-auto">
							Log In
						</Button>
					</Form.Group>
				</Form>
			</Col>
		</div>
	);
}
