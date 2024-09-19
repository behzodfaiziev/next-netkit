import type {AxiosRequestConfig} from "axios";

export interface INetworkManager {
  request<T>(config: AxiosRequestConfig): Promise<T>;
}