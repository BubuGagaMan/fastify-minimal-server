import { FastifyRequest, FastifyReply } from "fastify";
import UserRepository from "@db/entities/user/User.repository.js";
import bcrypt from "bcrypt";
import signJWT from "@utilities/signJWT.js";

interface UserLoginBody {
  username: string;
  password: string;
}

export const loginUser = async (
  req: FastifyRequest<{ Body: UserLoginBody }>,
  reply: FastifyReply
) => {
  console.log("LOGIN ROUTE ENTERED");
  const { username, password } = req.body;

  const user = await UserRepository.findOne({
    where: { username },
  });

  if (!user) {
    return reply
      .status(404)
      .send({ message: `User with username ${username} not found` });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  console.log("PASSWORD CORRECT:", isPasswordCorrect);

  if (!isPasswordCorrect) {
    return reply.status(401).send({
      message: "Unauthorised - incorrect password",
    });
  }
  
  const jwtToken = signJWT( req.server, {
    id: user.id,
    username: user.username
  }, "60s")

  reply.status(200).send({message: "Logged in successfully!", data: {accessToken: jwtToken}})
};

export const logoutUser = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {};

export const authenticateJWT = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {

  const accessJWT = req.headers['access-token']

  console.log(accessJWT)

};