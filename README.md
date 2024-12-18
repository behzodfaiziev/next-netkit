# Next-Netkit

Next-Netkit is a lightweight, injectable network manager built on top of Axios, designed to work
seamlessly with Clean Architecture and dependency injection frameworks like Inversify.
This package is ideal for both TypeScript and JavaScript projects and supports test-driven
development (TDD) by making network interactions mockable and testable.

## Table of Contents

- [Features](#features)
- [Changelog](#changelog)
- [Installation](#installation)
- [Usage](#usage)
  - [Setting Up the NetworkManager](#setting-up-the-networkmanager)
  - [Making Requests](#making-requests)
    - [Request](#request)
    - [RequestList](#requestlist)
    - [RequestVoid](#requestvoid)
  - [Refresh Token](#refresh-token)
    - [How to Configure Token Refresh](#how-to-configure-token-refresh)
    - [How It Works](#how-it-works)
  - [Ensuring Access Token is Refreshed Before Making a Request](#ensuring-access-token-is-refreshed-before-making-a-request)
    - [Key Points](#key-points)
      - [1. When to Use](#1-when-to-use)
      - [2. How It Works](#2-how-it-works)
      - [3. Fallback Handling](#3-fallback-handling)
  - [Making Requests according to the Clean Architecture](#making-requests-according-to-the-clean-architecture)
- [Integration with Inversify for Dependency Injection](#integration-with-inversify-for-dependency-injection)
  - [Container Module Setup](#container-module-setup)
  - [Merging Containers](#merging-containers)
- [License](#license)

  [//]: # "[Error Handling with ApiException](#error-handling-with-apiexception-according-to-the-clean-architecture)"

## Features

- **TypeScript-first**: Provides full type support and is easily usable in both TypeScript and
  JavaScript projects.
- **Axios Integration**: Built on top of Axios for flexible HTTP requests.
- **Dependency Injection**: Supports `Inversify` for clean and testable architecture.
- **Error Handling**: Customizable error handling using the `ApiException` class.
- **Clean Architecture**: Easily integrate with Clean Architecture principles.
- **Refresh Token Support**: Automatically refreshes the access token when it expires.

## Changelog

You can find the changelog [here](CHANGELOG.md).

## Installation

```bash
npm install next-netkit axios inversify
```

## Usage

### Setting Up the NetworkManager

You can create an instance of NetworkManager by passing the base URLs, mode
(development or production), Axios configuration options, and error-handling parameters.

```typescript
import { NetworkErrorParams, NetworkManager } from "next-netkit";

// Define your error-handling parameters
const networkErrorParams: NetworkErrorParams = {
  messageKey: "message",
  statusCodeKey: "status",
  couldNotParseError: "Could not parse error",
  jsonIsEmptyError: "JSON is empty",
  noInternetError: "No internet connection",
  jsonNullError: "JSON is null",
  jsonUnsupportedObjectError: "JSON is unsupported object",
  notMapTypeError: "Not map type",
};
/// In here NODE_ENV is an environment variable that is set to 'production' or 'development'
/// It may differ according to your project setup
const isTestMode = process.env.NODE_ENV !== "production";
// Create a new instance of NetworkManager
const networkManagerInstance = new NetworkManager({
  baseUrl: "https://api.example.com", // Production base URL
  devBaseUrl: "https://dev.example.com", // Development base URL
  testMode: isTestMode, // Test mode: false (production), true (development)
  baseOptions: {}, // Axios config options
  errorParams: networkErrorParams, // Error parameters
  withCredentials: true,
  refreshTokenPath: "api/auth/refresh-token",
});
```

## Making Requests:

### Request:

`request` is used to fetch or send data where a single response model is expected.

```typescript
// Example GET request to fetch a single model
const product = await networkManager.request<ProductModel>({
  method: RequestMethod.GET,
  url: "/api/product/1",
});
/// response.data is of type BookEntity

// Example POST request and get response
const signInResponse = await networkManager.request<SignInResponseDto>({
  method: RequestMethod.POST,
  url: "/api/auth/sign-in",
  data: signInRequestDto,
});
/// signInResponse.data is of type SignInResponseDto
```

### RequestList:

`requestList` is used when you expect the API to return an array of items.

```typescript
// Example GET request to fetch a list of products
const products = await networkManager.requestList<ProductModel>({
  method: RequestMethod.GET,
  url: "/api/v1/products",
});
/// response.data is of type ProductModel[]
```

This method ensures the response is an array and throws an error if a non-list is returned.

### RequestVoid:

`requestVoid` is used for requests where no data is expected in return (e.g., DELETE or POST
operations that don't return any data).

```typescript
// Example DELETE request with no response body expected
await networkManager.requestVoid({
  method: RequestMethod.DELETE,
  url: "/api/v1/products/1",
});
```

## Refresh Token

The NetworkManager automatically handles token refresh when an access token expires. You only need
to provide the API endpoint where the refresh token request is made. Once the access token expires,
the manager will automatically request a new one and retry the failed request with the new token.

### How to Configure Token Refresh

```typescript
const networkManagerInstance = new NetworkManager({
  // Other options (e.g., baseUrl, etc.)
  refreshTokenPath: "api/auth/refresh-token", // Path to the backend refresh token API
});
```

### How It Works

- **Token Expiry Detection**: When a request returns a 401 Unauthorized error due to an expired
  token, NetworkManager detects this and triggers the refresh process.
- **Token Refresh Request**: It sends a request to the provided refreshTokenPath to obtain a new
  access token.
- **Retrying Failed Requests**: Once the token is refreshed, it automatically retries the original
  failed request with the new token.

## Ensuring Access Token is Refreshed Before Making a Request

In some scenarios, you may want to ensure that an **access token is refreshed before making a
request**, particularly for actions that cannot be repeated easily without potential issues.

- For instance, when uploading a 100 MB video to a social media platform, you want to avoid
  uploading the video twice in case the access token is expired. To handle such situations
  gracefully, the request should explicitly ensure the access token is valid by triggering a token
  refresh before making the main request.

This feature requires that the `refreshTokenPath` is correctly configured in the `NetworkManager`
settings. Without it, token refresh functionality will not work.

Here’s an example of how to make such a request in TypeScript:

```typescript
const product = await networkManager.request<ProductModel>({
  method: RequestMethod.GET,
  url: "/api/product/1",
  isTokenRefreshRequired: true, // Ensure token refresh is triggered before the request
});
```

### Key Points:

#### 1. When to Use:

- Use **isTokenRefreshRequired: true** for requests that must be sent successfully and are critical
  in
  nature (e.g., uploading large files, important transactions).
- This ensures the access token is refreshed if it has expired, preventing failure due to
  unauthorized errors.

#### 2. How It Works:

- If **isTokenRefreshRequired** is set to **true**, the **NetworkManager** will first send a request
  to refresh the access token (using the configured **refreshTokenPath**).
- After refreshing the token, the main request will be executed.

#### 3. Fallback Handling:

- If the token refresh fails (e.g., due to an expired refresh token), the main request **will not
  proceed**, and an error will be thrown to prevent **redundant** or **unauthorized** actions.

## Making Requests according to the Clean Architecture

Using the Clean Architecture, you can create a `RemoteDataSource` class that implements an
interface, which can be injected into your repository class.

```typescript
/// src/feature-name/data/datasources/i-auth-remote-datasource.ts
export interface IAuthRemoteDataSource {
  signIn(signInDto: SignInDto): Promise<SignInResponseDto>;
}

/// src/feature-name/data/datasources/auth-remote-datasource.ts
@injectable()
export class AuthRemoteDataSource implements IAuthRemoteDataSource {
  constructor(@inject("INetworkManager") private networkManager: INetworkManager) {}

  async signIn(dto: SignInDto): Promise<SignInResponseDto> {
    return await this.networkManager.request<SignInResponseDto>({
      method: RequestMethod.POST,
      url: `/api/auth/sign-in`,
      data: dto,
    });
  }
}
```

Now, you can inject the `IAuthRemoteDataSource` into your repository class and use it to make
network requests.

```typescript
/// src/feature-name/data/repositories/auth-repository.ts
@injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @inject("IAuthRemoteDataSource") private remoteDataSource: IAuthRemoteDataSource,
    @inject("IAuthLocalDataSource") private localDataSource: IAuthLocalDataSource
  ) {}

  async signIn(dto: SignInDto): Promise<void> {
    try {
      const response = await this.remoteDataSource.signIn(dto);
      this.localDataSource.saveUser(response.user);
    } catch (error) {
      throw error;
    }
  }
}
```

[//]: #
[//]: # "## Error Handling with ApiException according to the Clean Architecture"
[//]: #
[//]: # "All errors returned by the network manager will be transformed into `ApiException` instances,"
[//]: # "providing consistent error-handling across your app. Which are caught with a try-catch block."
[//]: #
[//]: # "```typescript"
[//]: # "/// AuthController.ts"
[//]: # "@injectable()"
[//]: # "export class AuthController {"
[//]: # "  constructor(@inject(SignIn) private signInUseCase: SignIn) {}"
[//]: #
[//]: # "  async handleSignIn(dto: SignInDto): Promise<void> {"
[//]: # "    try {"
[//]: # "      return await this.signInUseCase.execute(dto);"
[//]: # "    } catch (error) {"
[//]: # "      throw error;"
[//]: # "    }"
[//]: # "  }"
[//]: # "}"
[//]: #
[//]: # "/// sign-in.tsx"
[//]: # "/// ... other codes"
[//]: # "const signInController = container.get<AuthController>(AuthController);"
[//]: #
[//]: # "const handleSignIn = async () => {"
[//]: # "  try {"
[//]: # "    const dto: SignInDto = { email, password };"
[//]: # "    setLoading(true);"
[//]: # "    await signInController.handleSignIn(dto);"
[//]: # '    router.push("/");'
[//]: # "  } catch (err) {"
[//]: # "    setLoading(false);"
[//]: # "    setError((err as ApiException).message);"
[//]: # "  }"
[//]: # "};"
[//]: # "/// ... other codes"
[//]: # "```"

## Integration with Inversify for Dependency Injection

`Next-Netkit` works seamlessly with `Inversify` to enable dependency injection. Here’s how you can
set
it up:

### Container Module Setup

Create a module for the network manager using `Inversify`.

```typescript
// network.container.ts
import { ContainerModule, interfaces } from "inversify";
import { INetworkManager, NetworkManager, NetworkErrorParams } from "next-netkit";

const networkManagerInstance = new NetworkManager({
  baseUrl: "https://api.example.com", // Production base URL
  devBaseUrl: "https://dev.example.com", // Development base URL
  testMode: isTestMode, // Test mode: false (production), true (development)
  baseOptions: {}, // Axios config options
  errorParams: networkErrorParams, // Error parameters
  withCredentials: true,
  refreshTokenPath: "api/auth/refresh-token",
});

// Create a network container module
const networkContainer = new ContainerModule((bind: interfaces.Bind) => {
  bind<INetworkManager>("INetworkManager").toConstantValue(networkManagerInstance);
});

export { networkContainer };
```

### Merging Containers

You can merge multiple containers, including the network container, like so:

```typescript
// main.container.ts
import { Container } from "inversify";
import { authContainer } from "./auth/auth.container";
import { networkContainer } from "./network.container";

const container = new Container();

// Merge containers
container.load(authContainer);
container.load(networkContainer);

export { container };
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### Dependencies

- **axios** - MIT License. See [axios repository](https://github.com/axios/axios) for license details.
- **inversify** - MIT License. See [inversify repository](https://github.com/inversify/InversifyJS) for license details.
- **reflect-metadata** - Apache-2.0 License. See [reflect-metadata repository](https://github.com/rbuckton/reflect-metadata) for license details.
