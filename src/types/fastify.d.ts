import "fastify";
import { DataSource } from "typeorm";
import { JWT } from "@fastify/jwt";

import UserRole from "./roles";

declare module "fastify" {
  interface FastifyInstance {
    db: DataSource;
    // @TODO - NEED CORRECT TYPE HERE
    authenticate: any
  }
  interface FastifyRequest {
    jwt: JWT;
  }
}

interface UserPayload {
  id: string;
  // email: string
  username: string;
  roles?: UserRole[]
};

interface userRolePayload {
  roles: userRole[]
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: UserPayload;
  }
}
