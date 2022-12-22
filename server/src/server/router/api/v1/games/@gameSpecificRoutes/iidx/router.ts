import { ValidatePlaytypeFromParamFor } from "../../_game/_playtype/middleware";
import { Router } from "express";
import { CUSTOM_TACHI_IIDX_PLAYLISTS } from "lib/game-specific/iidx-playlists";
import type { TachiIIDXPlaylist } from "lib/game-specific/iidx-playlists";

const router: Router = Router({ mergeParams: true });

/**
 * List all the playlists we have available.
 *
 * @name GET /api/v1/games/iidx/:playtype/playlists
 */
router.get("/:playtype/playlists", ValidatePlaytypeFromParamFor("iidx"), (req, res) => {
	const playlists = CUSTOM_TACHI_IIDX_PLAYLISTS.filter(
		(e) => e.playtype === null || e.playtype === req.params.playtype
	);

	const body = [];

	for (const playlist of playlists) {
		body.push({
			forSpecificUser: playlist.forSpecificUser,
			urlName: playlist.urlName,
			playlistName: playlist.playlistName,
			description: playlist.description,
		});
	}

	return res.status(200).json({
		success: true,
		description: `Found ${playlists.length} playlist(s)`,
		body: playlists,
	});
});

/**
 * Retrieve this playlist.
 *
 * @name GET /api/v1/games/iidx/:playtype/playlists/:playlistID
 */
router.get(
	"/:playtype/playlists/:playlistID",
	ValidatePlaytypeFromParamFor("iidx"),
	async (req, res) => {
		const playlist: TachiIIDXPlaylist | undefined = CUSTOM_TACHI_IIDX_PLAYLISTS.find(
			(e) =>
				(e.playtype === null || e.playtype === req.params.playtype) &&
				e.urlName === req.params.playlistID
		);

		if (!playlist) {
			return res.status(404).json({
				success: false,
				description: `No such playlist '${req.params.playlistID}' exists for '${req.params.playtype}'.`,
			});
		}

		if (playlist.forSpecificUser === true) {
			return res.status(404).json({
				success: false,
				description: `This playlist is for a specific user. Use the /users/:userID endpoint instead.`,
			});
		}

		const body = await playlist.getPlaylists(req.params.playtype as "DP" | "SP");

		return res.status(200).json(body);
	}
);

export default router;
