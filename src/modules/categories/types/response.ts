import { ApiResponse } from "../../../shares/types/response";
import { Category } from "./category";

type ListCategoriesResponse = ApiResponse<Category[]>;
type GetCategoryResponse = ApiResponse<Category>;
type CreateCategoryResponse = ApiResponse<Category>;
type UpdateCategoryResponse = ApiResponse<Category>;
type DeleteCategoryResponse = ApiResponse<null>;

export {
  ListCategoriesResponse,
  GetCategoryResponse,
  CreateCategoryResponse,
  UpdateCategoryResponse,
  DeleteCategoryResponse,
};
