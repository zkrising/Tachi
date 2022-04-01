import supertest from "supertest";
import server from "../server/server";

const mockServer = supertest(server);

// mock the server for requests
export default mockServer;
