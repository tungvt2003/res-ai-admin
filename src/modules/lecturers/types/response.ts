import { ApiResponse } from "../../../shares/types/response";
import { Lecturer } from "./lecturer";

type ListLecturersResponse = ApiResponse<Lecturer[]>;
type GetLecturerResponse = ApiResponse<Lecturer>;
type CreateLecturerResponse = ApiResponse<Lecturer>;
type UpdateLecturerResponse = ApiResponse<Lecturer>;
type DeleteLecturerResponse = ApiResponse<null>;

export {
  ListLecturersResponse,
  GetLecturerResponse,
  CreateLecturerResponse,
  UpdateLecturerResponse,
  DeleteLecturerResponse,
};
