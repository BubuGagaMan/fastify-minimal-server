import { FastifyRequest, FastifyReply } from "fastify";
import { getUserById } from "@services/user/User.services.js";
import bcryptHash from "@utilities/bcryptHash.js";
import UserRepository from "@db/entities/user/User.repository.js";
import RoleRepository from "@db/entities/role/Role.repository.js";
import { Role } from "@db/entities/role/Role.entity.js";
import { User } from "@src/db/entities/user/User.entity.js";

//@TODO - add params for all requests
//@TODO - need to clean up the requestwithUserIdParams type, given that the user req has been changed for the entire instance

interface CreateUserBody {
  username: string;
  email: string;
  password: string;
}

type RequestWithUserIdParams = FastifyRequest<{
  Params: { userId: string };
  user?: { id: string; username: string };
}>;

export default class UserController {
  private userRepository;

  constructor() {
    this.userRepository = UserRepository;
  }

  getAll = async (_req: FastifyRequest, reply: FastifyReply) => {
    const users = await this.userRepository.find({
      relations: { role: true },
    });

    return reply.status(200).send({
      message: "Successfully retrieved all users!",
      data: { users: users },
    });
  };

  getById = async (req: RequestWithUserIdParams, reply: FastifyReply) => {
    const { userId } = req.params;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { role: true },
    });

    if (!user) {
      return reply
        .status(404)
        .send({ message: "Failed to get user - user not found." });
    }

    return reply.status(200).send({
      message: `User successfully retrieved!`,
      data: { user },
    });
  };

  // @TODO - need to check if username/email exists
  create = async (
    req: FastifyRequest<{ Body: CreateUserBody }>,
    reply: FastifyReply
  ) => {
    const { username, password, email } = req.body;

    const passwordHash = await bcryptHash(password);

    const user = new User();
    user.username = username;
    user.password = passwordHash;
    user.email = email;

    const role = new Role(user);

    const savedUser = await RoleRepository.save(role);

    return reply
      .status(201)
      .send({ message: "User created successfully!", data: { savedUser } });
  };

  //@TODO - fix the body type
  updateById = async (
    req: FastifyRequest<{ Body: CreateUserBody; Params: { userId: string } }>,
    reply: FastifyReply
  ) => {
    const { userId } = req.params;
    const { username, password, email } = req.body;

    const user = await getUserById(userId);

    if (!user) {
      return reply
        .status(404)
        .send({ message: "Failed to update user - user not found." });
    }

    // could this be restructured into something lazier and less explicit?
    // e.g. looping over the body - have to ensure that there is a schema only allowing for certain body properties
    const updatedUser = {
      username: username ? username : user.username,
      password: password ? await bcryptHash(password) : user.password,
      email: email ? email : user.email,
    };

    this.userRepository.merge(user, updatedUser);

    await this.userRepository.save(user);

    return reply.status(200).send({
      message: `Successfully updated user!`,
      data: { user },
    });
  };

  deleteById = async (req: RequestWithUserIdParams, reply: FastifyReply) => {
    const { userId } = req.params;

    const targetUser = await getUserById(userId);

    if (targetUser) {
      await this.userRepository.remove(targetUser);
      return reply
        .status(204)
        .send({ message: `User successfully deleted!` });
    }

    return reply.status(404).send({ message: `Failed to delete user - user not found.` });
  };
}
