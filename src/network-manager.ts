import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";
import { injectable } from "inversify";

import { INetworkManager } from "./network-manager.interface";
import { NetworkErrorParams } from "./interfaces/network-error-params";
import { ApiException } from "./error/api-exception";
import { RequestMethod } from "./enums/request-method.enum";

interface NetworkManagerParams {
  baseUrl: string;
  devBaseUrl: string;
  testMode: boolean;
  baseOptions: AxiosRequestConfig;
  errorParams: NetworkErrorParams;
  isClientSideWeb: boolean;
}

@injectable()
class NetworkManager implements INetworkManager {
  private readonly baseUrl: string;
  private readonly devBaseUrl: string;
  private readonly testMode: boolean;
  /**
   * Base options for Axios requests.
   */
  private baseOptions: AxiosRequestConfig;
  /**
   * Error handling parameters for keys.
   */
  private readonly errorParams: NetworkErrorParams;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  /**
   * Indicates if the code is running on the client side.
   * @example
   * typeof window !== 'undefined' && typeof localStorage !== 'undefined'
   */
  private readonly isClientSide: boolean;

  private axiosInstance: AxiosInstance;

  constructor({ baseUrl, devBaseUrl, testMode, baseOptions, errorParams, isClientSideWeb }: NetworkManagerParams) {
    this.baseUrl = baseUrl;
    this.devBaseUrl = devBaseUrl;
    this.testMode = testMode;
    this.baseOptions = baseOptions;
    this.errorParams = errorParams;
    this.isClientSide = isClientSideWeb;

    this.axiosInstance = axios.create({
      baseURL: this.testMode ? this.devBaseUrl : this.baseUrl,
      // Additional config options
    });
    this.setTokensFromLocalStorage();
  }

  clearTokens(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    this.accessToken = null;
    this.refreshToken = null;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
    if (this.isClientSide) {
      localStorage.setItem("accessToken", token);
    }
  }

  setRefreshToken(token: string): void {
    this.refreshToken = token;
    if (this.isClientSide) {
      localStorage.setItem("refreshToken", token);
    }
  }

  setTokensFromLocalStorage(): void {
    if (this.isClientSide) {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      if (accessToken) {
        this.accessToken = accessToken;
      }
      if (refreshToken) {
        this.refreshToken = refreshToken;
      }
    }
  }

  private getHeaders(): Record<string, any> {
    return {
      ...(this.baseOptions.headers as Record<string, any>),
      ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
      ...(this.refreshToken ? { "Refresh-Token": this.refreshToken } : {}),
    };
  }

  async request<T>({
    url,
    config,
    method,
    data,
  }: {
    url: string;
    config?: AxiosRequestConfig;
    method: RequestMethod;
    data?: any;
  }): Promise<T> {
    // If config is not provided, create an empty object
    if (!config) {
      config = {};
    }

    config.url = url;
    config.data = data;
    config.method = RequestMethod.toString(method);
    config.headers = this.getHeaders();

    try {
      const response: AxiosResponse<T> = await this.axiosInstance.request(config);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw ApiException.fromJson(error.response.data, this.errorParams, error.response.status);
      }
      throw error;
    }
  }
}

export { NetworkManager };
