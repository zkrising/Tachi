import { APIFetchV1, ToCDNURL } from "util/api";
import { HumaniseError } from "util/humanise-error";
import { HistorySafeGoBack } from "util/misc";
import useSetSubheader from "components/layout/header/useSetSubheader";
import CenterPage from "components/util/CenterPage";
import SiteWordmark from "components/util/SiteWordmark";
import Divider from "components/util/Divider";
import { UserContext } from "context/UserContext";
import { useFormik } from "formik";
import { ClientConfig, TachiConfig } from "lib/config";
import React, { MutableRefObject, useContext, useRef, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import { Link, useHistory } from "react-router-dom";
import { UserDocument } from "tachi-common";
import { UseFormik } from "types/react";

// seconds it takes for a user to actually read the rules.
const RULES_READ_TIME = Number(process.env.VITE_RULES_READ_TIME) || 30;

export default function RegisterPage() {
	useSetSubheader("Register");

	const [err, setErr] = useState("");
	// not opened: user has not clicked the rules link
	// opened: user has clicked the rules link
	// read: atleast 30 seconds have expired.
	const [readRules, setReadRules] = useState<"not-opened" | "opened" | "read" | "acknowledged">(
		"not-opened"
	);
	const [disabled, setDisabled] = useState(true);
	const [btnText, setBtnText] = useState("I've read the rules. (Click the rules.)");

	const { setUser } = useContext(UserContext);
	const history = useHistory();
	const recaptchaRef = useRef<any>();

	const urlParams = new URLSearchParams(location.search);

	const formik = useFormik({
		initialValues: {
			username: "",
			"!password": "",
			confPassword: "",
			inviteCode: urlParams.get("inviteCode") ?? "",
			email: "",
			captcha: "temp",
		},
		onSubmit: async (values) => {
			if (values["!password"] !== values.confPassword) {
				setErr("Password and confirm password do not match!");
				return;
			}

			const rj = await APIFetchV1<UserDocument>(
				"/auth/register",
				{
					method: "POST",
					body: JSON.stringify({
						"!password": values["!password"],
						inviteCode: values.inviteCode,
						username: values.username.trim(),
						email: values.email,
						captcha: values.captcha,
					}),
					headers: {
						"Content-Type": "application/json",
					},
				},
				false,
				true
			);

			recaptchaRef.current.reset();

			if (!rj.success) {
				setErr(HumaniseError(rj.description));
				return;
			}

			toast.success("Created Account, Logged In!");

			setTimeout(() => {
				setUser(rj.body);
				localStorage.setItem("isLoggedIn", "true");

				HistorySafeGoBack(history);
			}, 500);
		},
	});

	function ReadRulesWait() {
		if (readRules !== "not-opened") {
			return;
		}

		setReadRules("opened");

		// users have to actually read the rules.
		let wait = RULES_READ_TIME;
		const tickerRef = setInterval(() => {
			wait--;
			setBtnText(`I've read the rules (${wait}s)`);
		}, 1000);

		setTimeout(() => {
			setReadRules("read");
			setBtnText("I've read the rules.");
			setDisabled(false);
			clearInterval(tickerRef);
		}, RULES_READ_TIME * 1000);
	}

	return (
		<CenterPage>
			<SiteWordmark />
			<div className="text-center mb-8">
				<h1>Register</h1>
				<span className="fw-bold text-muted">Have an account?</span>
				<Link to="/login" className="fw-bold ms-1">
					Sign in!
				</Link>
			</div>

			{readRules === "acknowledged" ? (
				<RegisterForm formik={formik} err={err} recaptchaRef={recaptchaRef} />
			) : (
				<div className="text-center">
					<div className="mb-8">
						<Alert variant="warning my-8">
							<b>
								If you already have an account. DO NOT MAKE ANOTHER ONE! That will
								get both accounts banned.
							</b>
						</Alert>
						<h4>
							Hey! Before you make an account, please read the{" "}
							<a
								href="https://docs.bokutachi.xyz/wiki/rules/"
								target="_blank"
								rel="noopener noreferrer"
								onAuxClick={ReadRulesWait}
								onClick={() => {
									setTimeout(() => ReadRulesWait(), 300);
								}}
							>
								Rules.
							</a>
						</h4>

						<h6>(This link opens in a new tab.)</h6>
					</div>

					<Divider className="my-6" />

					{readRules === "opened" ? (
						<p className="my-4">
							Hey, it takes longer than {RULES_READ_TIME} seconds to read the rules.
							<br />I know it sucks to wait around, but the few rules we have are
							enforced strictly.
							<br />
							The last thing you'd want is to accidentally get yourself banned!
						</p>
					) : (
						<></>
					)}

					<div className="justify-content-center d-flex">
						<Link to="/" tabIndex={-1} className="me-auto btn btn-outline-danger">
							Back
						</Link>
						<Button
							disabled={disabled}
							className="ms-auto"
							onClick={() => setReadRules("acknowledged")}
						>
							{btnText}
						</Button>
					</div>
				</div>
			)}
		</CenterPage>
	);
}

function RegisterForm({
	formik,
	err,
	recaptchaRef,
}: {
	formik: UseFormik<{
		username: string;
		"!password": string;
		confPassword: string;
		inviteCode: string;
		email: string;
		captcha: string;
	}>;
	err: string;
	recaptchaRef: MutableRefObject<any>;
}) {
	return (
		<Form
			className="w-100 px-4 mt-8"
			style={{ maxWidth: "620px" }}
			onSubmit={formik.handleSubmit}
		>
			<Form.Group className="mb-6">
				<Form.Label>Username</Form.Label>
				<Form.Control
					tabIndex={1}
					type="text"
					id="username"
					value={formik.values.username}
					onChange={formik.handleChange}
				/>
			</Form.Group>
			<Form.Group className="mb-6">
				<Form.Label>Email</Form.Label>
				<Form.Control
					tabIndex={2}
					type="email"
					id="email"
					value={formik.values.email}
					onChange={formik.handleChange}
					className="mb-2"
				/>
				<Form.Text className="text-muted">
					This is used for things like password recovery, and authentication checks. If
					this email is fake, and you forget your password,{" "}
					<b>You will be permanently locked out of your account.</b>
					<br />
					We will never use this to send spam!
				</Form.Text>
			</Form.Group>
			<Form.Group className="mb-6">
				<Form.Label>Password</Form.Label>
				<Form.Control
					tabIndex={3}
					type="password"
					id="!password"
					value={formik.values["!password"]}
					onChange={formik.handleChange}
				/>
			</Form.Group>
			<Form.Group className="mb-6">
				<Form.Label>Confirm Password</Form.Label>
				<Form.Control
					tabIndex={4}
					type="password"
					id="confPassword"
					value={formik.values.confPassword}
					onChange={formik.handleChange}
				/>
			</Form.Group>
			{ClientConfig.MANDATE_LOGIN && (
				<Form.Group className="mb-6">
					<Form.Label>Invite Code</Form.Label>
					<Form.Control
						tabIndex={5}
						type="text"
						id="inviteCode"
						value={formik.values.inviteCode}
						onChange={formik.handleChange}
					/>
				</Form.Group>
			)}
			<Form.Group
				style={{ display: err ? "" : "none" }}
				className="text-center text-danger mb-6"
			>
				{err}
			</Form.Group>
			<div className="my-6">
				{process.env.VITE_RECAPTCHA_KEY && (
					<ReCAPTCHA
						ref={recaptchaRef}
						sitekey={process.env.VITE_RECAPTCHA_KEY}
						onChange={(v) => {
							formik.setFieldValue("captcha", v);
						}}
					/>
				)}
			</div>
			<Form.Group className="justify-content-center d-flex">
				<Link to="/" tabIndex={7} className="me-auto btn btn-outline-danger">
					Back
				</Link>
				<Button tabIndex={6} type="submit" className="ms-auto">
					Register!
				</Button>
			</Form.Group>
		</Form>
	);
}
