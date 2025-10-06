// remove UserRole type at params - all else is the same as authorise.ts
//@TODO - would be nice to simply use roles from within the app for the tests, once there are more roles...

const testHasUserRoles
 = (userRoles: string[], necessaryRoles: string[]): boolean => {
  let hasRoles = false;
  for (const necessaryRole of necessaryRoles) {
    hasRoles = false;
    for (const userRole of userRoles) {
      if (necessaryRole === userRole) {
        hasRoles = true;
        break;
      }
    }
    if (!hasRoles) {
      return false;
    }
  }

  return true;
};

export default testHasUserRoles
