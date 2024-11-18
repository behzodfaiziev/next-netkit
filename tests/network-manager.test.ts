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
    // Mock axios.create to return an instance with interceptors
    mockedAxios.create.mockReturnValue({
      ...mockedAxios,
    } as unknown as AxiosInstance); // Cast it as any to avoid type errors

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

  it("should make a request and return data", async () => {
    const responseData = { data: "response" };
    mockedAxios.request.mockResolvedValue({ data: responseData });

    const config = { url: "/endpoint", method: RequestMethod.GET };
    const data = await networkManager.request(config);

    expect(data).toBe(responseData);
    expect(mockedAxios.request).toHaveBeenCalledWith({
      ...config,
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("should handle axios errors and throw ApiException", async () => {
    const errorResponse = {
      response: {
        data: { message: "error" }, // Mock error data
        status: 400,
      },
      message: "Request failed with status code 400", // Typical Axios error message
      config: {},
      isAxiosError: true,
    };

    mockedAxios.request.mockRejectedValue(errorResponse); // Mock rejected value for axios

    const config = { url: "/endpoint", method: RequestMethod.GET };

    await expect(networkManager.request(config)).rejects.toThrow(ApiException);

    // Optionally, you can also check if `ApiException` was thrown with the correct properties
    await expect(networkManager.request(config)).rejects.toThrow(expect.objectContaining({ message: "error" }));
  });
});
