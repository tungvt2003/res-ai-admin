import { AxiosInstance } from "axios";
import api from "../../../shares/configs/axios";

const endpoint = "/blogs/upload-base64";

export interface UploadBase64Response {
  data: {
    data: {
      urls: string[];
    };
  };
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface UploadBase64Request {
  images: string[];
}

class UploadBase64Client {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = api;
  }

  async uploadBase64Images(images: string[]): Promise<UploadBase64Response> {
    const response = await this.client.post<UploadBase64Response>(endpoint, {
      images,
    });
    return response.data;
  }
}

const UploadBase64Api = new UploadBase64Client();
export { UploadBase64Api };
