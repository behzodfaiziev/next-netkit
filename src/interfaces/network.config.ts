import {AxiosRequestConfig} from "axios";

export interface NetKitConfig {
  baseUrl: string;
  devBaseUrl: string;
  testMode?: boolean;
  baseOptions?: AxiosRequestConfig;
}