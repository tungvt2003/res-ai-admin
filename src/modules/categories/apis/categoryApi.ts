import { AxiosInstance } from "axios";
import api from "../../../shares/configs/axios";
import {
  CreateCategoryResponse,
  DeleteCategoryResponse,
  ListCategoriesResponse,
  UpdateCategoryResponse,
} from "../types/response";
import { Category } from "../types/category";
import { CreateCategoryBody, UpdateCategoryBody } from "../types/body";

const endpoint = "/categories";

class CategoryClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = api;
  }

  // ---------------- Create Category ----------------
  async create(categoryBody: CreateCategoryBody): Promise<CreateCategoryResponse> {
    const response = await this.client.post<CreateCategoryResponse>(endpoint, categoryBody);
    return response.data;
  }

  // ---------------- List All Categories ----------------
  async getAll(params?: Record<string, string | number>): Promise<ListCategoriesResponse> {
    const response = await this.client.get<ListCategoriesResponse>(endpoint, { params });
    return response.data;
  }

  // ---------------- Get Category By ID ----------------
  async getById(categoryId: string): Promise<Category> {
    const response = await this.client.get<Category>(`${endpoint}/${categoryId}`);
    return response.data;
  }

  // ---------------- Update Category ----------------
  async update(
    categoryId: string,
    updateData: UpdateCategoryBody,
  ): Promise<UpdateCategoryResponse> {
    const response = await this.client.patch<UpdateCategoryResponse>(
      `${endpoint}/${categoryId}`,
      updateData,
    );
    return response.data;
  }

  // ---------------- Delete Category ----------------
  async delete(categoryId: string): Promise<DeleteCategoryResponse> {
    const response = await this.client.delete<DeleteCategoryResponse>(`${endpoint}/${categoryId}`);
    return response.data;
  }
}

const CategoryApi = new CategoryClient();
export { CategoryApi };
