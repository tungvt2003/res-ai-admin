import z from "zod";

export const roleEnum = z.enum(["user", "admin"]);

export const createUserSchema = z.object({
  username: z.string().min(1, "Username không được để trống"),
  fullName: z.string().min(1, "Tên không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(1, "Số điện thoại không được để trống"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  roles: z.string().min(1, "Vai trò không được để trống"),
});
