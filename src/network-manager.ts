import type {AxiosRequestConfig, AxiosResponse} from "axios";
import axios from 'axios';
import {INetworkManager} from "./network-manager.interface";
import {NetworkErrorParams} from "./interfaces/network-error-params";
import {ApiException} from "./error/api-exception";
import {injectable} from "inversify";

@injectable()
class NetworkManager implements INetworkManager {

  private readonly baseUrl: string;
  private readonly devBaseUrl: string;
  private readonly testMode: boolean;
  private baseOptions: AxiosRequestConfig;
  private readonly errorParams: NetworkErrorParams;

  private instance = axios.create({
    baseURL: 'https://api.example.com',
    // Additional config options
  });

  constructor(
      baseUrl: string,
      devBaseUrl: string,
      testMode: boolean,
      baseOptions: AxiosRequestConfig,
      errorParams: NetworkErrorParams
  ) {
    this.baseUrl = baseUrl;
    this.devBaseUrl = devBaseUrl;
    this.testMode = testMode;
    this.baseOptions = baseOptions;
    this.errorParams = errorParams;

    this.instance.interceptors.response.use(
        response => response,
        error => {
          // Handle errors globally
          return Promise.reject(error);
        }
    );
  }

  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.request({
        ...config,
        url: this.testMode ? `${this.devBaseUrl}${config.url}` : `${this.baseUrl}${config.url}`,
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw ApiException.fromJson(error.response?.data, this.errorParams, error.response?.status);
      } else {
        throw error;
      }
    }
  }
}

export {NetworkManager};
