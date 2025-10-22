import { createCategorySchema } from "./createCategory.schema";

export const updateCategorySchema = createCategorySchema.partial();
