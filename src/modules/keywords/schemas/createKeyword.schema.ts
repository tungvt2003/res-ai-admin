import z from "zod";

export const createKeywordSchema = z.object({
  name: z.string().min(1, "Tên từ khóa không được để trống"),
});
