import z from "zod";

export const createBlogSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
  contents: z.string().min(1, "Nội dung không được để trống"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
});
