import { ApiResponse } from "../../../shares/types/response";
import { Keyword } from "./keyword";

type ListKeywordsResponse = ApiResponse<Keyword[]>;
type GetKeywordResponse = ApiResponse<Keyword>;
type CreateKeywordResponse = ApiResponse<Keyword>;
type UpdateKeywordResponse = ApiResponse<Keyword>;
type DeleteKeywordResponse = ApiResponse<null>;

export {
  ListKeywordsResponse,
  GetKeywordResponse,
  CreateKeywordResponse,
  UpdateKeywordResponse,
  DeleteKeywordResponse,
};
