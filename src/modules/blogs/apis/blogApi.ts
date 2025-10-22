import { AxiosInstance } from "axios";
import api from "../../../shares/configs/axios";
import {
  CreateBlogResponse,
  DeleteBlogResponse,
  GetBlogResponse,
  ListBlogsResponse,
  UpdateBlogResponse,
} from "../types/response";
import { Blog } from "../types/blog";

const endpoint = "/blogs";

class BlogClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = api;
  }

  // ---------------- Create Blog ----------------
  async create(blogBody: FormData): Promise<CreateBlogResponse> {
    // Don't set Content-Type for FormData - Axios will auto-detect and add boundary
    const response = await this.client.post<CreateBlogResponse>(endpoint, blogBody, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // ---------------- List All Blogs ----------------
  async getAll(params?: Record<string, string | number>): Promise<ListBlogsResponse> {
    const response = await this.client.get<ListBlogsResponse>(endpoint, { params });
    return response.data;
  }

  // ---------------- Get Blog By ID ----------------
  async getById(blogId: string): Promise<Blog> {
    const response = await this.client.get<GetBlogResponse>(`${endpoint}/${blogId}`);
    return response.data.data as Blog;
  }

  // ---------------- Update Blog ----------------
  async update(blogId: string, updateData: FormData): Promise<UpdateBlogResponse> {
    // Don't set Content-Type for FormData - Axios will auto-detect and add boundary
    const response = await this.client.patch<UpdateBlogResponse>(
      `${endpoint}/${blogId}`,
      updateData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  }

  // ---------------- Delete Blog ----------------
  async delete(blogId: string): Promise<DeleteBlogResponse> {
    const response = await this.client.delete<DeleteBlogResponse>(`${endpoint}/${blogId}`);
    return response.data;
  }
}

const BlogApi = new BlogClient();
export { BlogApi };
