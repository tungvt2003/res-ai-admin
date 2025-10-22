import z from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
  slug: z
    .string()
    .min(1, "Slug không được để trống")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số và dấu gạch ngang"),
});
