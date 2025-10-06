import { FastifyRequest } from "fastify";

//@TODO - need to observe how does this function, what does it return on failed
// verification, if unhappy - need to add a custom try catch, returning the desired 
// failed replies
const authenticate = async (req: FastifyRequest) => {
  const decodedJWTPayload = await req.server.jwt.verify(
    req.headers["access-token"] as string
  ) as {
    id: string;
    username: string;
  };
  req.user = {
    id: decodedJWTPayload.id,
    username: decodedJWTPayload.username,
  };
};

export default authenticate;
 