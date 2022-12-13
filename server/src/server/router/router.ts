import apiRouterV1 from "./api/v1/router";
import irRouter from "./ir/router";
import { RejectIfBanned, SetRequestPermissions } from "../middleware/auth";
import { NormalRateLimitMiddleware } from "../middleware/rate-limiter";
import { Router } from "express";
import { Environment } from "lib/setup/config";
import { UpdateLastSeen } from "server/middleware/update-last-seen";

const router: Router = Router({ mergeParams: true });

router.use(RejectIfBanned);

router.use("/ir", NormalRateLimitMiddleware, irRouter);

// request perms only apply to the api, IR may reuse this
// but also may require custom authentication.
router.use(SetRequestPermissions);
router.use(UpdateLastSeen);

router.use("/api/v1", apiRouterV1);

// if in localdev, add a debug endpoint to tell users when they got a successful fetch
// on the root endpoint.
// That is to say, if a user is hitting 127.0.0.1:8080/
// instead of "cannot GET /", they should get a nice message.
if (Environment.nodeEnv === "dev") {
	router.get("/", (req, res) => {
		return res.send(
			`Server is live and running. All is good!<br />
			This is a DEBUG endpoint and only exists in local dev.<br />
			<a href='/api/v1/status'>Click here to go to <code>/api/v1/status</code> endpoint.</a>`
		);
	});
}

export default router;
