/* eslint-disable no-console */
import bcrypt from "bcrypt";

console.log(bcrypt.hashSync("password", 12));
