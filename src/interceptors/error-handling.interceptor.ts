import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";
import { RequestQueue } from "@/services/request-queue.service";
export class ErrorHandlingInterceptor {
  private isRefreshing = false;

  constructor(
    private refreshTokenPath: string,
    private requestQueue: RequestQueue
  ) {}

  getInterceptor() {
    return {
      onResponseError: async (error: AxiosError): Promise<AxiosResponse | void> => {
        if (error.response?.status === 401 && this.refreshTokenPath) {
          if (error.config && error.config.url === this.refreshTokenPath) {
            // Reject all queued requests
            this.requestQueue.cancelAll("Token refresh failed");
            throw error;
          }

          if (this.isRefreshing && error.config) {
            // Queue request while token is being refreshed
            return this.requestQueue.enqueue(error.config);
          }

          this.isRefreshing = true;

          try {
            // Send token refresh request
            await axios.post(this.refreshTokenPath);
            this.isRefreshing = false;
            // Retry all queued requests after successful refresh
            await this.requestQueue.processQueue();
            if (error.config) {
              return axios.request(error.config); // Retry the original request
            }
          } catch (refreshError) {
            this.isRefreshing = false;
            // Reject all queued requests due to failed refresh
            if (refreshError instanceof Error) {
              this.requestQueue.cancelAll(refreshError.message);
            } else {
              this.requestQueue.cancelAll("Token refresh failed");
            }
            throw refreshError;
          }
        }

        // If it's not a 401 error or refresh token path, pass it along
        throw error;
      },
    };
  }
}
