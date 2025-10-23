import api from "../../../shares/configs/axios";
import { ApiResponse } from "../../../shares/types/response";
import { ConfigurationData } from "../types/configuration";

export interface SettingsKey {
  id: string;
  key: string;
  name: string;
  value_jsonb: ConfigurationData;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSettingsBody {
  key: string;
  name: string;
  value_jsonb: ConfigurationData;
}

export interface UpdateSettingsBody {
  key: string;
  name: string;
  value_jsonb: ConfigurationData;
}

type ListSettingsResponse = ApiResponse<SettingsKey[]>;
type GetSettingsResponse = ApiResponse<SettingsKey>;
type CreateSettingsResponse = ApiResponse<SettingsKey>;
type UpdateSettingsResponse = ApiResponse<SettingsKey>;

class SettingsClient {
  private client = api;

  constructor() {
    this.client = api;
  }

  // ---------------- Get All Settings ----------------
  async getAll(): Promise<ListSettingsResponse> {
    const response = await this.client.get<ListSettingsResponse>("/settings");
    return response.data;
  }

  // ---------------- Get Settings by Key ----------------
  async getByKey(key: string): Promise<GetSettingsResponse> {
    const response = await this.client.get<GetSettingsResponse>(`/settings/by-key/${key}`);
    return response.data;
  }

  // ---------------- Create Settings ----------------
  async create(body: CreateSettingsBody): Promise<CreateSettingsResponse> {
    const response = await this.client.post<CreateSettingsResponse>("/settings", body);
    return response.data;
  }

  // ---------------- Update Settings ----------------
  async update(body: UpdateSettingsBody): Promise<UpdateSettingsResponse> {
    const response = await this.client.patch<UpdateSettingsResponse>(
      `/settings/by-key/${body.key}`,
      body,
    );
    return response.data;
  }

  // ---------------- Delete Settings ----------------
  async delete(key: string): Promise<ApiResponse<null>> {
    const response = await this.client.delete<ApiResponse<null>>(`/settings/by-key/${key}`);
    return response.data;
  }
}

const SettingsApi = new SettingsClient();
export { SettingsApi };
