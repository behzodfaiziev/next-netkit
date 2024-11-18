import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
} from "axios";

export class RequestQueue {
  private queue: Array<{
    config: AxiosRequestConfig;
    cancelTokenSource: CancelTokenSource;
    resolve: (value: AxiosResponse) => void;
    reject: (reason?: any) => void;
  }> = [];

  /**
   * Adds a request to the queue and returns a promise for the queued request.
   */
  enqueue(config: AxiosRequestConfig): Promise<AxiosResponse> {
    const cancelTokenSource = axios.CancelToken.source();

    return new Promise<AxiosResponse>((resolve, reject) => {
      this.queue.push({
        config: { ...config, cancelToken: cancelTokenSource.token },
        cancelTokenSource,
        resolve,
        reject,
      });
    });
  }

  /**
   * Processes all queued requests sequentially.
   */
  async processQueue(): Promise<void> {
    while (this.queue.length) {
      const request = this.queue.shift();
      if (request) {
        try {
          const response = await axios.request(request.config);
          request.resolve(response);
        } catch (error) {
          request.reject(error);
        }
      }
    }
  }

  /**
   * Cancels all queued requests with the provided error reason.
   */
  cancelAll(reason: string): void {
    while (this.queue.length) {
      const request = this.queue.shift();
      if (request) {
        request.cancelTokenSource.cancel(reason);
        request.reject(
          new axios.Cancel(`Request canceled: ${reason}`)
        );
      }
    }
  }
}
