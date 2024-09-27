import type {AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
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
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  private instance: AxiosInstance;


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


    this.instance = axios.create({
      baseURL: this.testMode ? this.devBaseUrl : this.baseUrl,
      // Additional config options
    });
    this.setTokensFromLocalStorage();

    this.instance.interceptors.response.use(
        response => response,
        error => {
          // Handle errors globally
          return Promise.reject(error);
        }
    );
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }

  setRefreshToken(token: string): void {
    this.refreshToken = token;
    localStorage.setItem('refreshToken', token);
  }

  setTokensFromLocalStorage(): void {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (accessToken) {
      this.accessToken = accessToken;
    }
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
  }

  private getHeaders(): Record<string, any> {
    return {
      ...this.baseOptions.headers as Record<string, any>,
      ...(this.accessToken ? {'Authorization': `Bearer ${this.accessToken}`} : {}),
      ...(this.refreshToken ? {'Refresh-Token': this.refreshToken} : {}),
    };
  }
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.request({
        ...config,
        headers: this.getHeaders(),
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