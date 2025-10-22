import { z } from "zod";
import { createBlogSchema } from "../schemas/createBlog.schema";
import { updateBlogSchema } from "../schemas/updateBlog.schema";

type CreateBlogBody = z.infer<typeof createBlogSchema>;
type UpdateBlogBody = z.infer<typeof updateBlogSchema>;

export { CreateBlogBody, UpdateBlogBody };
