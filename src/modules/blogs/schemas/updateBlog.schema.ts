import { createBlogSchema } from "./createBlog.schema";

export const updateBlogSchema = createBlogSchema.partial();
