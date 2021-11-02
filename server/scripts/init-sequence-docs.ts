import { InitSequenceDocs } from "external/mongo/sequence-docs";

if (require.main === module) {
	InitSequenceDocs().then(() => process.exit(0));
}
