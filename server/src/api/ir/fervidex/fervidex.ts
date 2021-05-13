import { Router, RequestHandler } from "express";
import { RequireLoggedIn } from "../../../middleware/require-logged-in";

const router: Router = Router({ mergeParams: true });

const RequireInf2Header: RequestHandler = async (req, res, next) => {
    let swModel = req.header("X-Software-Model");

    if (!swModel || !swModel.startsWith("P2D:J:B:A")) {
        return res.status(400).send();
    }

    return next();
};

/**
 * Submits all of a users data to Kamaitachi. This data is extremely minimal,
 * as only a users Lamp and Score are sent. As such, this is not the prefered
 * way of syncing scores outside of INF2, where there is no other way to
 * retrieve scores.
 *
 * @name /api/ir/fervidex/profile/submit
 */
router.post("/profile/submit", RequireLoggedIn, RequireInf2Header, async (req, res) => {
    throw new Error("Unimplemented.");
});

/**
 * Submits a single score to Kamaitachi. In contrast to profile/submit, this
 * sends the most data (and most accurate data) of any score hook.
 * As such, this is the preferred way of submitting IIDX scores to Kamaitachi.
 *
 * @name /api/ir/fervidex/score/submit
 */
router.post("/score/submit", RequireLoggedIn, async (req, res) => {
    throw new Error("Unimplemented.");
});

/**
 * Submits the result of a class to Kamaitachi. This contains the dan played
 * and whether it was achieved.
 *
 * @name /api/ir/fervidex/class/submit
 */
router.post("/class/submit", RequireLoggedIn, async (req, res) => {
    throw new Error("Unimplemented.");
});

export default router;
