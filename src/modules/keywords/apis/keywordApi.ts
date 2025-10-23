import { AxiosInstance } from "axios";
import api from "../../../shares/configs/axios";
import {
  CreateKeywordResponse,
  DeleteKeywordResponse,
  ListKeywordsResponse,
  UpdateKeywordResponse,
} from "../types/response";
import { Keyword } from "../types/keyword";
import { CreateKeywordBody, UpdateKeywordBody } from "../types/body";

const endpoint = "/keywords";

class KeywordClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = api;
  }

  // ---------------- Create Keyword ----------------
  async create(keywordBody: CreateKeywordBody): Promise<CreateKeywordResponse> {
    const response = await this.client.post<CreateKeywordResponse>(endpoint, keywordBody);
    return response.data;
  }

  // ---------------- List All Keywords ----------------
  async getAll(params?: Record<string, string | number>): Promise<ListKeywordsResponse> {
    const response = await this.client.get<ListKeywordsResponse>(endpoint, { params });
    return response.data;
  }

  // ---------------- Get Keyword By ID ----------------
  async getById(keywordId: string): Promise<Keyword> {
    const response = await this.client.get<Keyword>(`${endpoint}/${keywordId}`);
    return response.data;
  }

  // ---------------- Update Keyword ----------------
  async update(keywordId: string, updateData: UpdateKeywordBody): Promise<UpdateKeywordResponse> {
    const response = await this.client.patch<UpdateKeywordResponse>(
      `${endpoint}/${keywordId}`,
      updateData,
    );
    return response.data;
  }

  // ---------------- Delete Keyword ----------------
  async delete(keywordId: string): Promise<DeleteKeywordResponse> {
    const response = await this.client.delete<DeleteKeywordResponse>(`${endpoint}/${keywordId}`);
    return response.data;
  }
}

const KeywordApi = new KeywordClient();
export { KeywordApi };
