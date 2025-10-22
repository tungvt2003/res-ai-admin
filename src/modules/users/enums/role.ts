enum Role {
  User = "user",
  Admin = "admin",
}

export { Role };

const RoleLabel: Record<Role, string> = {
  [Role.User]: "Người dùng",
  [Role.Admin]: "Quản trị viên",
};

export { RoleLabel };
