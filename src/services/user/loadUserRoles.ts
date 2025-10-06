import UserRepository from "@db/entities/user/User.repository.js";
import UserRole from "../../types/roles.js";

const loadUserRoles = async (userId: string) => {
  const userRoles: UserRole[] = [];
  const user = await UserRepository.findOne({
    where: { id: userId },
    relations: { role: true },
  });

  if (user) {
    for (const key in user.role) {
      if (key !== "id" && key !== "user" && user.role[key as UserRole]) {
        userRoles.push(key as UserRole);
      }
    }
  }
  return userRoles;
};

export default loadUserRoles;
