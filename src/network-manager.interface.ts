import type {AxiosRequestConfig} from "axios";

export interface INetworkManager {
  request<T>(config: AxiosRequestConfig): Promise<T>;

  setAccessToken(token: string): void;

  setRefreshToken(token: string): void;

  clearTokens(): void;
}