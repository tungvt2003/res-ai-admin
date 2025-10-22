import z from "zod";

export const roleEnum = z.enum([
  "patient", // Bệnh nhân
  "doctor", // Bác sĩ
  "admin", // Quản trị viên
]);

export const createUserSchema = z.object({
  username: z.string().min(1, "Username không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, "Mật khẩu phải có ít nhất 1 chữ cái và 1 số"),
  firebase_uid: z.string().min(1, "Firebase UID không được để trống"),
  role: roleEnum,
});
