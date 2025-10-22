enum Role {
  Patient = "patient",
  Doctor = "doctor",
  Admin = "admin",
  Hospital = "hospital",
}

export { Role };

const RoleLabel: Record<Role, string> = {
  [Role.Patient]: "Bệnh nhân",
  [Role.Doctor]: "Bác sĩ",
  [Role.Admin]: "Quản trị viên",
  [Role.Hospital]: "Bệnh viện",
};

export { RoleLabel };
