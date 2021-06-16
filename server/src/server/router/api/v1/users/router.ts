import { Router } from "express";
import db from "../../../../../external/mongo/db";
import userIDRouter from "./_userID/router";

const router: Router = Router({ mergeParams: true });

/**
 * List Users.
 * @param online - Only return online users.
 * @param username - Return users similar to this username.
 * @name GET /api/v1/users
 */
router.get("/", async (req, res) => {
    // i dont know yet.
});

router.use("/:userID", userIDRouter);

export default router;
