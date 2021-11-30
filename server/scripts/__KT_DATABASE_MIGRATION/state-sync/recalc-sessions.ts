import { RecalcSessions } from "utils/calculations/recalc-sessions";

if (require.main === module) {
	RecalcSessions().then(() => process.exit(0));
}
