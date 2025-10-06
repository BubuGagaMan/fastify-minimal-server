import { FastifyInstance } from "fastify";
import { loginUser, logoutUser } from "@controllers/auth/Auth.controller.js";

export default async function authR(app: FastifyInstance) {
  app.post("/login", loginUser);
  app.post("/logout", logoutUser);
}
