import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelToken } from "axios";
import { injectable } from "inversify";

import { INetworkManager } from "./network-manager.interface";
import { NetworkErrorParams } from "./interfaces/network-error-params";
import { ApiException } from "./error/api-exception";
import { RequestMethod, requestMethodToString } from "./enums/request-method.enum";
import { RequestQueue } from "./services/request-queue.service";
import { ErrorHandlingInterceptor } from "./interceptors/error-handling.interceptor";

interface NetworkManagerParams {
  baseUrl: string;
  devBaseUrl: string;
  testMode: boolean;
  baseOptions: AxiosRequestConfig;
  errorParams: NetworkErrorParams;
  cancelToken?: CancelToken;
  withCredentials?: boolean;
  refreshTokenPath?: string;
}

@injectable()
class NetworkManager implements INetworkManager {
  /**
   * Base options for Axios requests.
   */
  private baseOptions: AxiosRequestConfig;
  /**
   * Error handling parameters for keys.
   */
  private readonly errorParams: NetworkErrorParams;

  private axiosInstance: AxiosInstance;
  private errorInterceptor: ErrorHandlingInterceptor;
  private readonly refreshTokenPath?: string;

  constructor({
    baseUrl,
    devBaseUrl,
    testMode,
    refreshTokenPath,
    baseOptions,
    errorParams,
    withCredentials = true,
    cancelToken,
  }: NetworkManagerParams) {
    const url = testMode ? devBaseUrl : baseUrl;
    this.errorInterceptor = new ErrorHandlingInterceptor(new RequestQueue(), url, refreshTokenPath);

    this.baseOptions = baseOptions;
    this.errorParams = errorParams;
    this.refreshTokenPath = refreshTokenPath;
    this.axiosInstance = axios.create({
      baseURL: url,
      withCredentials: withCredentials,
      cancelToken: cancelToken,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      this.errorInterceptor.getInterceptor().onResponseError
    );
  }

  private getHeaders(): Record<string, any> {
    return {
      ...(this.baseOptions.headers as Record<string, any>),
    };
  }

  async request<T>({
    url,
    config,
    method,
    data,
    isTokenRefreshRequired = false,
  }: {
    url: string;
    config?: AxiosRequestConfig;
    method: RequestMethod;
    data?: any;
    isTokenRefreshRequired?: boolean; // Flag to indicate whether to refresh token before request
  }): Promise<T> {
    const configuration: AxiosRequestConfig<any> = this.setConfigs(config, url, method, data);

    // If token refresh is required, handle it first
    if (isTokenRefreshRequired) {
      await this.refreshTokenIfNeeded();
    }

    try {
      const response: AxiosResponse<T> = await this.axiosInstance.request(configuration);
      if (Array.isArray(response.data)) {
        throw new ApiException(400, "Response is not an object");
      }
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw ApiException.fromJson(error.response.data, this.errorParams, error.response.status);
      }
      throw error;
    }
  }

  /**
   * Handles a request and returns a list of items.
   */
  async requestList<T>({
    url,
    config,
    method,
    data,
    isTokenRefreshRequired = false,
  }: {
    url: string;
    config?: AxiosRequestConfig;
    method: RequestMethod;
    data?: any;
    isTokenRefreshRequired?: boolean; // Flag to indicate whether to refresh token before request
  }): Promise<T[]> {
    const configuration: AxiosRequestConfig<any> = this.setConfigs(config, url, method, data);

    // If token refresh is required, handle it first
    if (isTokenRefreshRequired) {
      await this.refreshTokenIfNeeded();
    }

    try {
      const response: AxiosResponse<T[]> = await this.axiosInstance.request(configuration);
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        throw new ApiException(400, "Response is not a list");
      }
    } catch (error: any) {
      if (error.response) {
        throw ApiException.fromJson(error.response.data, this.errorParams, error.response.status);
      }
      throw error;
    }
  }

  /**
   * Handles requests that do not return any data.
   */
  async requestVoid({
    url,
    config,
    method,
    data,
    isTokenRefreshRequired = false, // Default to false
  }: {
    url: string;
    config?: AxiosRequestConfig;
    method: RequestMethod;
    data?: any;
    isTokenRefreshRequired?: boolean; // Flag to indicate whether to refresh token before request
  }): Promise<void> {
    const configuration: AxiosRequestConfig<any> = this.setConfigs(config, url, method, data);

    // If token refresh is required, handle it first
    if (isTokenRefreshRequired) {
      await this.refreshTokenIfNeeded();
    }

    try {
      await this.axiosInstance.request(configuration);
    } catch (error: any) {
      if (error.response) {
        throw ApiException.fromJson(error.response.data, this.errorParams, error.response.status);
      }
      throw error;
    }
  }

  private setConfigs(
    config: AxiosRequestConfig<any> | undefined,
    url: string,
    method: RequestMethod,
    data: any
  ): AxiosRequestConfig<any> {
    config = config || {};
    config.url = url;
    config.data = data;
    config.method = requestMethodToString(method);
    config.headers = this.getHeaders();
    return config;
  }

  private async refreshTokenIfNeeded() {
    // Trigger token refresh if the path is set
    if (this.refreshTokenPath) {
      try {
        await this.axiosInstance.post(this.refreshTokenPath, {}, { withCredentials: true });
      } catch (error: any) {
        throw ApiException.fromJson(error.response.data, this.errorParams, error.response.status);
      }
    }
  }
}

export { NetworkManager };
