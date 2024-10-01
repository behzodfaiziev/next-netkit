import "reflect-metadata";
import axios, { AxiosInstance } from "axios";
import { jest } from "@jest/globals";
import { ApiException, NetworkErrorParams, NetworkManager } from "../..";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => (store[key] = value),
    removeItem: (key: string) => delete store[key],
    clear: () => (store = {}),
  };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock });

describe("FakeStoreApi Integration Test", () => {
  let networkManager: NetworkManager;
  const baseUrl = "https://fakestoreapi.com";
  const devBaseUrl = "https://fakestoreapi.com";
  const testMode = false;
  const baseOptions = { headers: { "Content-Type": "application/json" } };
  const errorParams: NetworkErrorParams = new NetworkErrorParams({});
  const isClientSideWeb = true;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

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
      isClientSideWeb,
    });
  });

  test("Request a Single Model - Success Case", async () => {
    const mockResponse = {
      data: [{ id: 1, title: "Test Product" }],
    };
    mockedAxios.request.mockResolvedValue(mockResponse);

    const config = { url: "/products", method: "GET" };
    const response = await networkManager.request(config);

    expect(response).toBeDefined();
    expect(response).toBeInstanceOf(Array);
    expect(response).not.toHaveLength(0);
  });

  test("Request a Single Model - Failure Case: Wrong API", async () => {
    const errorResponse = {
      response: {
        data: { message: "Not Found" },
        status: 404,
      },
    };
    mockedAxios.request.mockRejectedValue(errorResponse);

    const config = { url: "/products", method: "GET" };

    await expect(networkManager.request(config)).rejects.toThrow(ApiException);
    await expect(networkManager.request(config)).rejects.toThrow(
      expect.objectContaining({
        message: "Not Found",
      })
    );
  });

  // Additional tests can be added here as needed
});
