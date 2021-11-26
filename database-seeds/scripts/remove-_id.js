const { IterateCollections } = require("./util");

IterateCollections((data) => {
	for (const d of data) {
		delete d._id;
	}

	return data;
});
