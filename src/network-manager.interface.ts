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
    config?: AxiosRequestConfig;
    method: RequestMethod;
    data?: any;
  }): Promise<T>;

  requestList<T>({
    url,
    config,
    method,
    data,
  }: {
    url: string;
    config?: AxiosRequestConfig;
    method: RequestMethod;
    data?: any;
  }): Promise<T[]>;

  requestVoid({
    url,
    config,
    method,
    data,
  }: {
    url: string;
    config?: AxiosRequestConfig;
    method: RequestMethod;
    data?: any;
  }): Promise<void>;

  setAccessToken(token: string): void;

  setRefreshToken(token: string): void;

  clearTokens(): void;
}
