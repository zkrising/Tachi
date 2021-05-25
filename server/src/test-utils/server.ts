import server from "../server/server";
import supertest from "supertest";

const mockServer = supertest(server);

// mock the server for requests
export default mockServer;
