import z from "zod";

export const createLecturerSchema = z.object({
  fullName: z.string().min(1, "Tên giảng viên không được để trống"),
  academicTitle: z.string().min(1, "Học hàm không được để trống"),
  workUnit: z.string().min(1, "Đơn vị công tác không được để trống"),
  position: z.string().min(1, "Chức vụ không được để trống"),
  website: z.string().url("Website không hợp lệ").optional().or(z.literal("")),
  // isActive: z.boolean().optional().default(true),
});
