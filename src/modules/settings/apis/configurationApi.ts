import { AxiosInstance } from "axios";
import api from "../../../shares/configs/axios";
import { Configuration } from "../types/configuration";
import { GetConfigurationResponse, UpdateConfigurationResponse } from "../types/response";
import { UpdateConfigurationBody } from "../types/body";

const endpoint = "/settings";

class ConfigurationClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = api;
  }

  // ---------------- Get Configuration by Key ----------------
  async getByKey(key: string): Promise<Configuration> {
    const response = await this.client.get<GetConfigurationResponse>(`${endpoint}/${key}`);
    return response.data.data as Configuration;
  }

  // ---------------- Update Configuration ----------------
  async update(body: UpdateConfigurationBody): Promise<UpdateConfigurationResponse> {
    const response = await this.client.patch<UpdateConfigurationResponse>(
      `${endpoint}/${body.key}`,
      body,
    );
    return response.data;
  }
}

const ConfigurationApi = new ConfigurationClient();
export { ConfigurationApi };
