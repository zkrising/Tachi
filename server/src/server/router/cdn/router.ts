import { Router } from "express";
import { CDNRedirect } from "../../../lib/cdn/cdn";

const router: Router = Router({ mergeParams: true });

/**
 * Redirect all /cdn/ requests to this servers' CDN. This is so the client can refer to
 * (url)/cdn, and still have it resolve to our CDN internally.
 *
 * @example <script src="/cdn/foo"></script> instead of <script src= "{{CDN_URL}}/foo"></script>
 *
 * @name GET /cdn/*
 */
router.get("*", (req, res) => {
	console.log(req.originalUrl);
	const url = req.originalUrl.replace(/^\/cdn/u, "");
	console.log(url);
	return CDNRedirect(res, url);
});

export default router;
