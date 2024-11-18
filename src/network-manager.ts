import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelToken } from "axios";
import { injectable } from "inversify";

import { INetworkManager } from "./network-manager.interface";
import { NetworkErrorParams } from "./interfaces/network-error-params";
import { ApiException } from "./error/api-exception";
import { RequestMethod } from "./enums/request-method.enum";
import { RequestQueue } from "@/services/request-queue.service";
import { ErrorHandlingInterceptor } from "@/interceptors/error-handling.interceptor";

interface NetworkManagerParams {
  baseUrl: string;
  devBaseUrl: string;
  testMode: boolean;
  baseOptions: AxiosRequestConfig;
  errorParams: NetworkErrorParams;
  cancelToken?: CancelToken;
  withCredentials?: boolean;
  refreshTokenPath: string;
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

  private axiosInstance: AxiosInstance;
  private errorInterceptor: ErrorHandlingInterceptor;

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

    this.errorInterceptor = new ErrorHandlingInterceptor(
      refreshTokenPath,
      new RequestQueue(),
    );


    this.baseUrl = baseUrl;
    this.devBaseUrl = devBaseUrl;
    this.testMode = testMode;
    this.baseOptions = baseOptions;
    this.errorParams = errorParams;
    this.axiosInstance = axios.create({
      baseURL: this.testMode ? this.devBaseUrl : this.baseUrl,
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
  }: {
    url: string;
    config?: AxiosRequestConfig;
    method: RequestMethod;
    data?: any;
  }): Promise<T> {
    config = config || {};
    config.url = url;
    config.data = data;
    config.method = RequestMethod.toString(method);
    config.headers = this.getHeaders();

    try {
      const response: AxiosResponse<T> = await this.axiosInstance.request(config);
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
  }: {
    url: string;
    config?: AxiosRequestConfig;
    method: RequestMethod;
    data?: any;
  }): Promise<T[]> {
    config = config || {};
    config.url = url;
    config.data = data;
    config.method = RequestMethod.toString(method);
    config.headers = this.getHeaders();

    try {
      const response: AxiosResponse<T[]> = await this.axiosInstance.request(config);
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
  }: {
    url: string;
    config?: AxiosRequestConfig;
    method: RequestMethod;
    data?: any;
  }): Promise<void> {
    config = config || {};
    config.url = url;
    config.data = data;
    config.method = RequestMethod.toString(method);
    config.headers = this.getHeaders();

    try {
      await this.axiosInstance.request(config);
    } catch (error: any) {
      if (error.response) {
        throw ApiException.fromJson(error.response.data, this.errorParams, error.response.status);
      }
      throw error;
    }
  }
}

export { NetworkManager };
