import { AxiosInstance } from "axios";
import api from "../../../shares/configs/axios";
import {
  CreateLecturerResponse,
  DeleteLecturerResponse,
  ListLecturersResponse,
  UpdateLecturerResponse,
} from "../types/response";
import { Lecturer } from "../types/lecturer";

const endpoint = "/lecturers";

class LecturerClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = api;
  }

  // ---------------- Create Lecturer ----------------
  async create(lecturerBody: FormData): Promise<CreateLecturerResponse> {
    // Don't set Content-Type for FormData - Axios will auto-detect and add boundary
    const response = await this.client.post<CreateLecturerResponse>(endpoint, lecturerBody, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // ---------------- List All Lecturers ----------------
  async getAll(params?: Record<string, string | number>): Promise<ListLecturersResponse> {
    const response = await this.client.get<ListLecturersResponse>(endpoint, { params });
    return response.data;
  }

  // ---------------- Get Lecturer By ID ----------------
  async getById(lecturerId: string): Promise<Lecturer> {
    const response = await this.client.get<Lecturer>(`${endpoint}/${lecturerId}`);
    return response.data;
  }

  // ---------------- Update Lecturer ----------------
  async update(lecturerId: string, updateData: FormData): Promise<UpdateLecturerResponse> {
    // Don't set Content-Type for FormData - Axios will auto-detect and add boundary
    const response = await this.client.patch<UpdateLecturerResponse>(
      `${endpoint}/${lecturerId}`,
      updateData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  }

  // ---------------- Delete Lecturer ----------------
  async delete(lecturerId: string): Promise<DeleteLecturerResponse> {
    const response = await this.client.delete<DeleteLecturerResponse>(`${endpoint}/${lecturerId}`);
    return response.data;
  }
}

const LecturerApi = new LecturerClient();
export { LecturerApi };
