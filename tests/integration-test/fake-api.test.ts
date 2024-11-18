import "reflect-metadata";
import { NetworkManager } from "../../src/network-manager";
import { ApiException } from "../../src/error/api-exception";
import { RequestMethod } from "../../src/enums/request-method.enum";
import { INetworkManager } from "../../src/network-manager.interface";
import { NetworkErrorParams } from "../../src/interfaces/network-error-params";

describe("NetworkManager Integration Test", () => {
  let networkManager: INetworkManager;
  const errorParams: NetworkErrorParams = new NetworkErrorParams({
    messageKey: "error_message",
    statusCodeKey: "status_code",
  });

  beforeAll(() => {
    networkManager = new NetworkManager({
      baseUrl: "https://fakestoreapi.com",
      devBaseUrl: "https://dev.fakestoreapi.com",
      testMode: false,
      baseOptions: { headers: { "Content-Type": "application/json" } },
      errorParams,
      refreshTokenPath: "/refresh",
    });
  });

  // Request List Success Case
  test("should fetch products successfully (requestList)", async () => {
    const response = await networkManager.requestList<ProductModel>({
      url: "/products",
      method: RequestMethod.GET,
    });

    expect(Array.isArray(response)).toBe(true);
    expect(response.length).toBeGreaterThan(0);
    response.forEach((product) => {
      testProductModel(product);
      expect(product.rating).toHaveProperty("rate");
      expect(product.rating).toHaveProperty("count");
    });
  });

  // Request List Failure Case: Wrong API
  test("should handle 404 error for incorrect endpoint (requestList)", async () => {
    try {
      await networkManager.requestList<ProductModel>({
        url: "/invalid-endpoint",
        method: RequestMethod.GET,
      });
    } catch (error) {
      expect((error as ApiException).statusCode).toBe(404);
    }
  });

  // Request a Single Model - Success Case
  test("should fetch a single product successfully (request)", async () => {
    const response = await networkManager.request<ProductModel>({
      url: "/products/1",
      method: RequestMethod.GET,
    });

    testProductModel(response);
  });

  // Request a Single Model - Failure Case: Wrong API
  test("should handle 404 error for incorrect endpoint (request)", async () => {
    try {
      await networkManager.request<ProductModel>({
        url: "/invalid-endpoint",
        method: RequestMethod.GET,
      });
    } catch (error) {
      expect((error as ApiException).statusCode).toBe(404);
    }
  });

  // Wrong method called on Manager: requestModel expecting list but received a single object
  test("should handle wrong method call: requestModel expecting list but got object", async () => {
    try {
      await networkManager.request<ProductModel>({
        url: "/products", // Single product instead of list
        method: RequestMethod.GET,
      });
    } catch (error) {
      expect((error as ApiException).message).toBe("Response is not an object");
    }
  });

  // Request Void - Success Case
  test("should make a successful POST request (request)", async () => {
    const response = await networkManager.request<ProductModel>({
      url: "/products",
      method: RequestMethod.POST,
      data: {
        title: "Test Product",
        price: 10,
        description: "This is a test product",
        image: "https://fakestoreapi.com/img/test-image.jpg",
        category: "test-category",
      },
    });
    testProductModel(response);
    expect(response.title).toBe("Test Product");
    expect(response.price).toBe(10);
    expect(response.description).toBe("This is a test product");
    expect(response.image).toBe("https://fakestoreapi.com/img/test-image.jpg");
    expect(response.category).toBe("test-category");
  });

  // Request Void - Failure Case
  test("should handle error for DELETE request (requestVoid)", async () => {
    try {
      await networkManager.requestVoid({
        url: "/invalid-endpoint",
        method: RequestMethod.DELETE,
      });
    } catch (error) {
      expect((error as ApiException).statusCode).toBe(404);
    }
  });
});

function testProductModel(response: ProductModel) {
  expect(response).toBeInstanceOf(Object);
  expect(response).toHaveProperty("id");
  expect(response).toHaveProperty("title");
  expect(response).toHaveProperty("price");
  expect(response).toHaveProperty("description");
  expect(response).toHaveProperty("category");
  expect(response).toHaveProperty("image");
}
