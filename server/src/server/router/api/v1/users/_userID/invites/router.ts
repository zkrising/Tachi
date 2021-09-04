import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { GetTotalAllowedInvites } from "lib/invites/invites";
import { RequireKamaitachi } from "server/middleware/type-require";
import { InviteCodeDocument } from "tachi-common";
import { Random20Hex } from "utils/misc";
import { GetUsersWithIDs } from "utils/user";
import { RequireSelfRequestFromUser } from "../middleware";

const router: Router = Router({ mergeParams: true });

router.use(RequireKamaitachi);
router.use(RequireSelfRequestFromUser);

/**
 * Retrieve all of this users created invites.
 *
 * @name GET /api/v1/users/:userID/invites
 */
router.get("/", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	const invites = await db.invites.find({
		createdBy: user.id,
	});

	const consumers = await GetUsersWithIDs(
		invites.map((e) => e.consumedBy).filter((e) => e !== null) as number[]
	);

	return res.status(200).json({
		success: true,
		description: `Found ${invites.length} invites.`,
		body: { invites, consumers },
	});
});

/**
 * Return how many invites this user can create, and how many they
 * have already created.
 *
 * @name GET /api/v1/users/:userID/invites/limit
 */
router.get("/limit", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	const invites = await db.invites.count({ createdBy: user.id });
	const limit = GetTotalAllowedInvites(user);

	return res.status(200).json({
		success: true,
		description: `Calculated invite limit.`,
		body: {
			invites,
			limit,
		},
	});
});

const InviteLocks = new Set();

/**
 * Create a new invite.
 *
 * @name POST /api/v1/users/:userID/invites/create
 */
router.post("/create", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	// race condition protection
	// to avoid users double-creating invites.
	if (InviteLocks.has(user.id)) {
		return res.status(409).json({
			success: false,
			description: `You already have an outgoing invite creation request.`,
		});
	}

	InviteLocks.add(user.id);

	const existingInvites = await db.invites.count({ createdBy: user.id });

	if (existingInvites >= GetTotalAllowedInvites(user)) {
		InviteLocks.delete(user.id);

		return res.status(400).json({
			success: false,
			description: `You already have your maximum amount of outgoing invites.`,
		});
	}

	const inviteDoc: InviteCodeDocument = {
		code: Random20Hex(),
		consumed: false,
		consumedAt: null,
		consumedBy: null,
		createdAt: Date.now(),
		createdBy: user.id,
	};

	await db.invites.insert(inviteDoc);

	InviteLocks.delete(user.id);

	return res.status(200).json({
		success: true,
		description: `Created Invite.`,
		body: inviteDoc,
	});
});

export default router;
