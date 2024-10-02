import type { AxiosRequestConfig } from "axios";
import { RequestMethod } from "./enums/request-method.enum";

export interface INetworkManager {
  request<T>({
    url,
    config,
    method,
    data,
  }: {
    url: string;
    config: AxiosRequestConfig;
    method: RequestMethod;
    data?: any;
  }): Promise<T>;

  setAccessToken(token: string): void;

  setRefreshToken(token: string): void;

  clearTokens(): void;
}
