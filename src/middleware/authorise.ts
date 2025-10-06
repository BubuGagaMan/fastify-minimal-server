import { FastifyReply, FastifyRequest } from "fastify";
import UserRole from "../types/roles.js";
import hasUserRoles from "@utilities/hasUserRoles.js";
import loadUserRoles from "@services/user/loadUserRoles.js";

type RequestWithIdParams = FastifyRequest<{
  Params?: { userId: string };
}>;

const authorise = async (
  req: RequestWithIdParams,
  reply: FastifyReply,
  necessaryRoles: UserRole[],
  authoriseIfSelf?: boolean
) => {
  if (req.params?.userId && authoriseIfSelf) {
    const userId: string = req.params.userId;
    if (req.user.id === userId) {
      return;
    }
  }
  const userRoles = await loadUserRoles(req.user.id);
  if (!hasUserRoles(userRoles, necessaryRoles)) {
    reply.status(403).send({
      error: "Failed to complete request - unauthorised",
    });
    return;
  } else if (req.params?.userId && authoriseIfSelf && necessaryRoles.length === 0) {
    const userId: string = req.params.userId;
    if (req.user.id !== userId) {
      reply.status(403).send({
        error: "Failed to complete request - unauthorised",
      });
    }
    return;
  }

  return;

};

export default authorise;
