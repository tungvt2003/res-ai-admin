import { z } from "zod";
import { createCategorySchema } from "../schemas/createCategory.schema";
import { updateCategorySchema } from "../schemas/updateCategory.schema";

type CreateCategoryBody = z.infer<typeof createCategorySchema>;
type UpdateCategoryBody = z.infer<typeof updateCategorySchema>;

export { CreateCategoryBody, UpdateCategoryBody };
