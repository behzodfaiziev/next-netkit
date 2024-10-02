import type { AxiosRequestConfig } from "axios";
import { RequestMethod } from "./enums/request-method.enum";

export interface INetworkManager {
  request<T>({ config, method }: { config: AxiosRequestConfig; method: RequestMethod }): Promise<T>;

  setAccessToken(token: string): void;

  setRefreshToken(token: string): void;

  clearTokens(): void;
}
