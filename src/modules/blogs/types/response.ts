import { ApiResponse } from "../../../shares/types/response";
import { Blog } from "./blog";

type ListBlogsResponse = ApiResponse<Blog[]>;
type GetBlogResponse = ApiResponse<Blog>;
type CreateBlogResponse = ApiResponse<Blog>;
type UpdateBlogResponse = ApiResponse<Blog>;
type DeleteBlogResponse = ApiResponse<null>;

export {
  ListBlogsResponse,
  GetBlogResponse,
  CreateBlogResponse,
  UpdateBlogResponse,
  DeleteBlogResponse,
};
