import type { AxiosRequestConfig } from "axios";
import { RequestMethod } from "./enums/request-method.enum";

export interface INetworkManager {
  request<T>({
    url,
    config,
    method,
    data,
    isTokenRefreshRequired,
  }: {
    url: string;
    config?: AxiosRequestConfig;
    method: RequestMethod;
    data?: any;
    isTokenRefreshRequired?: boolean;
  }): Promise<T>;

  requestList<T>({
    url,
    config,
    method,
    data,
    isTokenRefreshRequired,
  }: {
    url: string;
    config?: AxiosRequestConfig;
    method: RequestMethod;
    data?: any;
    isTokenRefreshRequired?: boolean;
  }): Promise<T[]>;

  requestVoid({
    url,
    config,
    method,
    data,
    isTokenRefreshRequired,
  }: {
    url: string;
    config?: AxiosRequestConfig;
    method: RequestMethod;
    data?: any;
    isTokenRefreshRequired?: boolean;
  }): Promise<void>;
}
