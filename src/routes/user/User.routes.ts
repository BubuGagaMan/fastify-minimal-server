import { FastifyInstance, FastifyRequest } from "fastify";
import UserController from "@controllers/user/User.controller.js";
import userSchemas from "./User.routes.schemas.js";

import authorise from "@middleware/authorise.js";

//@TODO - check if this is good fix for get all
type RequestWithIdParams = FastifyRequest<{
  Params?: { userId: string };
}>;

export default async function userR(app: FastifyInstance) {
  const userController = new UserController();

  app.get(
    "/user",
    {
      onRequest: [
        app.authenticate,
        async (req: RequestWithIdParams, reply) => {
          await authorise(req, reply, ["admin"]);
        },
      ],
    },
    userController.getAll
  );

  app.get(
    "/user/:userId",
    {
      onRequest: [
        app.authenticate,
        async (req, reply) => {
          await authorise(req, reply, ["admin"], true);
        },
      ],
    },
    userController.getById
  );

  app.post(
    "/user",
    {
      schema: userSchemas.create,
    },
    userController.create
  );

  app.put(
    "/user/:userId",
    {
      schema: userSchemas.updateById,
      onRequest: [
        app.authenticate,
        async (req, reply) => {
          await authorise(req as RequestWithIdParams, reply, ["admin"], true);
        },
      ],
    },
    userController.updateById
  );

  app.delete(
    "/user/:userId",
    {
      onRequest: [
        app.authenticate,
        async (req, reply) => {
          await authorise(req, reply, ["admin"], true);
          //@TODO - need to check if this is needed
          if (reply.sent) return;
        },
      ],
    },
    userController.deleteById
  );
}
