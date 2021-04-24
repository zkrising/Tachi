import monk from "monk";

export const oldKTDB = monk(`${process.env.MONGO_BASE_URL}/kamaitachidb`);
