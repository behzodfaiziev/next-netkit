import "reflect-metadata";
import axios, { AxiosInstance } from "axios";
import { jest } from "@jest/globals";
import { NetworkManager } from "../src/network-manager";
import { NetworkErrorParams } from "../src/interfaces/network-error-params";
import { ApiException } from "../src/error/api-exception";
import { RequestMethod } from "../src/enums/request-method.enum";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("NetworkManager", () => {
  let networkManager: NetworkManager;
  const baseUrl = "https://api.example.com";
  const devBaseUrl = "https://dev.api.example.com";
  const testMode = false;
  const baseOptions = { headers: { "Content-Type": "application/json" } };
  const errorParams: NetworkErrorParams = new NetworkErrorParams({});

  beforeEach(() => {
    mockedAxios.request.mockReset(); // Clears previous mock calls
    mockedAxios.post.mockReset(); // Clears any mock of post as well
    // Mock axios.create to return an instance with interceptors
    mockedAxios.create.mockReturnValue({
      ...mockedAxios,
    } as unknown as AxiosInstance);

    networkManager = new NetworkManager({
      baseUrl,
      devBaseUrl,
      testMode,
      baseOptions,
      errorParams,
      withCredentials: true,
      cancelToken: undefined,
      refreshTokenPath: "/refresh",
    });
  });

  // === Request Method ===
  it("should make a request and return data", async () => {
    const responseData = { data: "response" };
    mockedAxios.request.mockResolvedValue({ data: responseData });

    const config = { url: "/endpoint", method: RequestMethod.GET };
    const data = await networkManager.request(config);

    expect(data).toBe(responseData);
    expect(mockedAxios.request).toHaveBeenCalledWith({
      ...config,
      headers: { "Content-Type": "application/json" },
    });
  });

  it("should handle axios errors and throw ApiException", async () => {
    const errorResponse = {
      response: {
        data: { message: "error" },
        status: 400,
      },
      message: "Request failed with status code 400",
      config: {},
      isAxiosError: true,
    };

    mockedAxios.request.mockRejectedValue(errorResponse);

    const config = { url: "/endpoint", method: RequestMethod.GET };

    await expect(networkManager.request(config)).rejects.toThrow(ApiException);
  });

  // === Token Refresh Handling ===

  it("should trigger token refresh if isTokenRefreshRequired is true", async () => {
    // First mock call: Refresh token request
    const refreshResponse = { data: "new token" };
    mockedAxios.post.mockResolvedValueOnce(refreshResponse); // First call for refresh token

    // Second mock call: Main request after token refresh
    const mainResponse = { data: { name: "mocked named", surname: "mockedSurname" } };
    mockedAxios.request.mockResolvedValueOnce(mainResponse); // Second call for the main API call

    // Call the request method with isTokenRefreshRequired set to true
    const data = await networkManager.request<FakeDataDTO>({
      url: "/endPoint",
      method: RequestMethod.GET,
      isTokenRefreshRequired: true,
    });

    // Assert that the main request data is returned after the token refresh
    expect(data.name).toBe(mainResponse.data.name);
    expect(data.surname).toBe(mainResponse.data.surname);

    // Assert that axios.request was called twice: once for the refresh and once for the main
    // request
    expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it("should not trigger token refresh if isTokenRefreshRequired is false", async () => {
    const responseData = { data: { name: "mocked named", surname: "mockedSurname" } };
    mockedAxios.request.mockResolvedValueOnce(responseData);

    const data = await networkManager.request<FakeDataDTO>({
      url: "endPoint",
      method: RequestMethod.GET,
      isTokenRefreshRequired: false,
    });

    expect(data.name).toBe(responseData.data.name);
    expect(data.surname).toBe(responseData.data.surname);
    expect(mockedAxios.request).toHaveBeenCalledTimes(1); // Only one call for the main request
  });

  it("should handle token refresh failure and not retry the main request", async () => {
    const refreshError = {
      response: {
        status: 401,
        data: { message: "Unauthorized" },
      },
    };

    mockedAxios.post.mockRejectedValueOnce(refreshError); // Mock failed refresh token response

    await expect(
      networkManager.request({ url: "/endpoint", method: RequestMethod.GET, isTokenRefreshRequired: true })
    ).rejects.toThrow("Unauthorized");
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.request).toHaveBeenCalledTimes(0); // No main request retry
  });

  // === Request List Method ===

  it("should fetch a list of items successfully", async () => {
    const responseData = [{ name: "Item 1" }, { name: "Item 2" }];
    mockedAxios.request.mockResolvedValueOnce({ data: responseData });

    const config = { url: "/endpoint", method: RequestMethod.GET };
    const data = await networkManager.requestList(config);

    expect(data).toEqual(responseData);
    expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    expect(mockedAxios.request).toHaveBeenCalledWith({
      ...config,
      headers: { "Content-Type": "application/json" },
    });
  });

  it("should trigger token refresh and fetch list successfully if required", async () => {
    const refreshResponse = { data: "new token" };
    mockedAxios.post.mockResolvedValueOnce(refreshResponse); // Refresh token request

    const responseData = [{ name: "Item 1" }, { name: "Item 2" }];
    mockedAxios.request.mockResolvedValueOnce({ data: responseData });

    const config = { url: "/endpoint", method: RequestMethod.GET, isTokenRefreshRequired: true };
    const data = await networkManager.requestList(config);

    expect(data).toEqual(responseData);
    expect(mockedAxios.post).toHaveBeenCalledTimes(1); // Token refresh called
    expect(mockedAxios.request).toHaveBeenCalledTimes(1); // Main request called
  });

  it("should handle errors during requestList and throw ApiException", async () => {
    const errorResponse = {
      response: { status: 400, data: { message: "Bad Request" } },
    };
    mockedAxios.request.mockRejectedValueOnce(errorResponse);

    const config = { url: "/endpoint", method: RequestMethod.GET };

    await expect(networkManager.requestList(config)).rejects.toThrow(ApiException);
    expect(mockedAxios.request).toHaveBeenCalledTimes(1);
  });

  // === Request void Method ===

  it("should handle void requests successfully", async () => {
    mockedAxios.request.mockResolvedValueOnce({}); // No data expected for void requests

    const config = { url: "/endpoint", method: RequestMethod.POST };
    await expect(networkManager.requestVoid(config)).resolves.not.toThrow();

    expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    expect(mockedAxios.request).toHaveBeenCalledWith({
      ...config,
      headers: { "Content-Type": "application/json" },
    });
  });

  it("should handle void requests with token refresh", async () => {
    const refreshResponse = { data: "new token" };
    mockedAxios.post.mockResolvedValueOnce(refreshResponse); // Refresh token request

    mockedAxios.request.mockResolvedValueOnce({}); // Main request

    const config = { url: "/endpoint", method: RequestMethod.POST, isTokenRefreshRequired: true };
    await expect(networkManager.requestVoid(config)).resolves.not.toThrow();

    expect(mockedAxios.post).toHaveBeenCalledTimes(1); // Refresh token called
    expect(mockedAxios.request).toHaveBeenCalledTimes(1); // Main request called
  });

  it("should handle errors during requestVoid and throw ApiException", async () => {
    const errorResponse = {
      response: { status: 500, data: { message: "Internal Server Error" } },
    };
    mockedAxios.request.mockRejectedValueOnce(errorResponse);

    const config = { url: "/endpoint", method: RequestMethod.POST };

    await expect(networkManager.requestVoid(config)).rejects.toThrow(ApiException);
    expect(mockedAxios.request).toHaveBeenCalledTimes(1);
  });

  // Advanced Tests for Token Refresh Scenarios

  // === Token Refresh Failure with request ===
  it("should handle token refresh failure for request and not retry the main request", async () => {
    const refreshError = {
      response: { status: 401, data: { message: "Unauthorized" } },
    };
    mockedAxios.post.mockRejectedValueOnce(refreshError);

    const config = { url: "/endpoint", method: RequestMethod.GET, isTokenRefreshRequired: true };

    await expect(networkManager.request(config)).rejects.toThrow("Unauthorized");
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.request).toHaveBeenCalledTimes(0); // Main request not retried
  });

  // === Token Refresh Failure with requestList ===

  it("should handle token refresh failure for requestList and not retry the main request", async () => {
    const refreshError = {
      response: { status: 401, data: { message: "Unauthorized" } },
    };
    mockedAxios.post.mockRejectedValueOnce(refreshError);

    const config = { url: "/endpoint", method: RequestMethod.GET, isTokenRefreshRequired: true };

    await expect(networkManager.requestList(config)).rejects.toThrow("Unauthorized");
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.request).toHaveBeenCalledTimes(0); // Main request not retried
  });

  // === Token Refresh Failure with requestVoid ===

  it("should handle token refresh failure for requestVoid and not retry the main request", async () => {
    const refreshError = {
      response: { status: 401, data: { message: "Unauthorized" } },
    };
    mockedAxios.post.mockRejectedValueOnce(refreshError);

    const config = { url: "/endpoint", method: RequestMethod.POST, isTokenRefreshRequired: true };

    await expect(networkManager.requestVoid(config)).rejects.toThrow("Unauthorized");
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.request).toHaveBeenCalledTimes(0); // Main request not retried
  });
});
