import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { Migration } from "utils/types";
import UGPTRivalsMigration from "./migrations/add-rivals-to-ugpt";

const logger = CreateLogCtx(__filename);

// Migrations are stored in an array because they have some concept of order
// That is, migrations should ideally be applied in a fixed order just to avoid
// any potential unsavoury interactions.
const REGISTERED_MIGRATIONS: Migration[] = [UGPTRivalsMigration];

function CreateMigrationLookupMap(migrations: Migration[]) {
	const map = new Map<string, Migration>();

	for (const mig of migrations) {
		if (map.get(mig.id)) {
			logger.crit(
				`Multiple migrations are registered for ${mig.id}. Cannot safely apply migrations.`
			);
			process.exit(1);
		}

		map.set(mig.id, mig);
	}

	return map;
}

// That said, we still make a lookup map so we can efficiently find registered
// migrations.
const MIGRATION_LOOKUP = CreateMigrationLookupMap(REGISTERED_MIGRATIONS);

/**
 * Return the migrationID of all migrations that have not been applied.
 */
export async function FindUnappliedMigrations() {
	const migrations = await db.migrations.find(
		{},
		{
			projection: {
				migrationID: 1,
			},
		}
	);

	const appliedIDs = new Set(migrations.map((e) => e.migrationID));

	const notApplied = [];

	for (const migration of REGISTERED_MIGRATIONS) {
		if (!appliedIDs.has(migration.id)) {
			notApplied.push(migration.id);
		}
	}

	return notApplied;
}

/**
 * Applies a migration. Will **EXIT TACHI** if a migration fails to apply, as this implies
 * database level inconsistencies which could cause severe problems.
 */
export async function ApplyMigration(migrationID: string) {
	logger.info(`Recieved request to apply migration '${migrationID}'.`);

	// Lock the migration here:
	// If the migration is already applied (i.e. migrationID is set and pending/applied)
	// don't bother applying again
	// If the migration isn't, set it as pending and continue. This is race-condition
	// safe.
	const wasApplied = await db.migrations.findOneAndUpdate(
		{ migrationID },
		{
			$setOnInsert: {
				migrationID,
				status: "pending",
			},
		},
		{
			returnOriginal: true,
			upsert: true,
		}
	);

	if (wasApplied) {
		logger.error(`Tried to apply migration ${migrationID}, but it was already applied.`);
		throw new Error(`Tried to apply migration ${migrationID}, but it was already applied.`);
	}

	const migration = MIGRATION_LOOKUP.get(migrationID);

	if (!migration) {
		logger.error(
			`Attempted to apply migration ${migrationID}, but that migration doesn't exist?`
		);
		throw new Error(
			`Attempted to apply migration ${migrationID}, but that migration doesn't exist?`
		);
	}

	try {
		await migration.up();

		logger.info(`Successfully applied migration '${migrationID}'.`);

		await db.migrations.update(
			{
				migrationID,
			},
			{
				$set: {
					status: "applied",
					appliedOn: Date.now(),
				},
			}
		);

		logger.info(`Successfully set migration state for '${migrationID}' to applied.`);
	} catch (err) {
		logger.severe(
			`Failed to apply migration '${migrationID}'. Attempting to revert migration. Tachi will exit after attempting to revert this migration.`,
			{ err }
		);

		try {
			await migration.down();

			logger.info(
				`Successfully reverted migration. Database state is okay, but Tachi will not boot.`
			);

			logger.crit(
				`Failed to apply migration '${migrationID}'. Although successfully reverted, Tachi will not boot if a migration fails.`
			);
		} catch (err) {
			logger.crit(
				`FAILED TO REVERT PARTIAL MIGRATION '${migrationID}'. THE DATABASE IS ALMOST CERTAINLY TAINTED. MANUAL INTERVENTION/BACKUP RESTORE NECESSARY.`,
				{
					err,
				}
			);
		}

		process.exit(1);
	}
}
