import axios, { AxiosError, AxiosResponse, HttpStatusCode } from "axios";
import { RequestQueue } from "../services/request-queue.service";

export class ErrorHandlingInterceptor {
  private isRefreshing = false;

  constructor(
    private requestQueue: RequestQueue,
    private baseUrl: string,
    private refreshTokenPath?: string
  ) {}

  getInterceptor() {
    return {
      onResponseError: async (error: AxiosError): Promise<AxiosResponse | void> => {
        /// Throw error if there is no refresh token path
        if (!this.refreshTokenPath) {
          throw error;
        }

        /// Reject all queued requests if the error is a 401 sent from the refresh token path
        if (error.response?.status === 401 && error.config?.url === this.refreshTokenPath) {
          // Reject all queued requests
          this.requestQueue.cancelAll("Token refresh failed");
          throw error;
        }
        /// Handle 401 errors by refreshing the token
        if (error.response?.status === 401) {
          if (this.isRefreshing && error.config) {
            // Queue request while token is being refreshed
            return this.requestQueue.enqueue(error.config);
          }

          this.isRefreshing = true;

          try {
            // Send token refresh request
            const result = await axios.post(`${this.baseUrl}/${this.refreshTokenPath}`, {}, { withCredentials: true });
            if (result.status >= HttpStatusCode.MultipleChoices) {
              throw new Error("Token refresh failed");
            }

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
