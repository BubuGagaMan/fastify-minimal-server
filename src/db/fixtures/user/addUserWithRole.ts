import bcryptHash from "@utilities/bcryptHash.js";
//@TODO - typeRoots needs to be added in ts config - see error otherwise
import UserRole from "../../../types/roles.js";
import { Role } from "../../entities/role/Role.entity.js";
import { User } from "../../entities/user/User.entity.js";
import { EntityManager } from "typeorm";

type UserData = {
  username: string,
  password: string,
  email: string,
  id?: string,
  hasRoles?: string[]
}

const addUserWithRole = async (
  userData: UserData,
  manager: EntityManager // pass EntityManager from QueryRunner
) => {
  const passwordHash = await bcryptHash(userData.password);
  const user = manager.create(User, {
    id: userData.id,
    username: userData.username,
    password: passwordHash,
    email: userData.email
  });

  const role = manager.create(Role, { user });
  if (userData.hasRoles) {
    for (const hasRole of userData.hasRoles) {
      role[hasRole as UserRole] = true;
    }
  }

  await manager.save(role);
};

export default addUserWithRole;



