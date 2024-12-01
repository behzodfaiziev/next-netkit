# Changelog

## [0.8.3-dev]

- added `isTokenRefreshRequired` method to check if the token refresh is required before sending a
  request

## [0.8.0]

> Note: This version has breaking changes.

- `setAccessToken`, `setRefreshToken`, `clearTokens` methods are removed, since the tokens should be
  managed by backend's http only cookies.
- `accessToken` and `refreshToken` properties are removed, since the tokens should be managed by
  backend's http only cookies.
- `isClientSideWeb` method is removed, since it is not necessary anymore.
- added `refreshTokenPath` for the path of the refresh token cookie

## [0.7.0]

- added `withCredentials` and `cancelToken` as optional parameters in constructor
- exported

## [0.6.2]

- updated gitHub actions to use strict check on formatting
- updated README.md

## [0.6.1]

- updated documentation

## [0.6.0]

- added more options for requests: `requestList`, `requestVoid`
- added integration tests
- updated README.md

## [0.5.3]

- added `RequestMethod` enum to define request methods so that it make the code more stable
- Deprecated: `request` method no longer accepts positional parameters. It now accepts named
  parameters: `url`, `data`, `method` and `config:?`.
  Here is an example of how to use the new `request` method:

```typescript
return this.networkManager.request<SignInResponseDto>({
  method: RequestMethod.POST,
  url: `/api/auth/sign-in`,
  data: dto,
});
```

## [0.5.3-dev]

- made `config` optional in `request` method

## [0.5.2-dev] Note: This version has breaking changes.

- updated `request` to get `url` and `data` directly from params
  Here is an example of how to use the new `request` method:

```typescript
/// Before

return this.networkManager.request<SignInResponseDto>({
  method: RequestMethod.POST,
  config: {
    url: `/api/auth/sign-in`,
    data: dto,
  },
});
/// After
return this.networkManager.request<SignInResponseDto>({
  method: RequestMethod.POST,
  url: `/api/auth/sign-in`,
  data: dto,
});
```

## [0.5.1-dev]

- fixed importing issues

## [0.5.0-dev] Note: This version has breaking changes.

- added `RequestMethod` enum to define request methods so that it make the code more stable
- Deprecated: `request` method no longer accepts positional parameters. It now accepts named
  parameters.
  Here is an example of how to use the new `request` method:

```typescript
/// Before
return this.networkManager.request<SignInResponseDto>({
  method: "POST",
  url: `/api/auth/sign-in`,
  data: dto,
});

/// After
return this.networkManager.request<SignInResponseDto>({
  method: RequestMethod.POST,
  config: {
    url: `/api/v1/auth/sign_in`,
    data: dto,
  },
});
```

## [0.4.2]

- fixed importing issue

## [0.4.1]

- updated License to MIT in order to be compliant with other dependencies
- added testing workflow so that PRs are scanned before reviewed

## [0.4.0]

- Added a .prettierrc configuration file to define Prettier formatting rules. (.prettierrc) by
  @remidosol
- Introduced an `ESLint` configuration file with TypeScript support and `Prettier` integration. (
  eslint.config.js) by @remidosol
- Updated package.json to include new scripts for formatting and linting, and added necessary
  dependencies. (package.json) by @remidosol
- Code Consistency: Updated various files to use double quotes instead of single quotes for string literals to align
  with the new Prettier configuration. by @remidosol

## [0.3.3]

- Exported `ApiException` class

## [0.3.2]

- added `clearTokens` method to clear access and refresh tokens from local storage and memory

## [0.3.1] Note: This version has breaking changes.

- Breaking update: NetworkManager's constructor now accepts named parameters
  Here is an example of how to use the new constructor:

```typescript
const networkManagerInstance = new NetworkManager({
  baseUrl: "https://api.example.com", // Production base URL
  devBaseUrl: "https://dev.example.com", // Development base URL
  testMode: false, // Test mode: false (production), true (development)
  baseOptions: {}, // Axios config options
  errorParams: networkErrorParams, // Error parameters
  isClientSideWeb: typeof window !== "undefined" && typeof localStorage !== "undefined",
});
```

`Deprecated` usage:

```typescript
const networkManager = new NetworkManager(
  "https://api.example.com", // Production base URL
  "https://dev.example.com", // Development base URL
  false, // Test mode: false (production), true (development)
  {}, // Axios config options
  networkErrorParams // Error parameters
);
```

## [0.2.4]

- added `isClientSideWeb` method to check if the code is running on the client side web

## [0.2.1]

- fixed importing issue in next applications

## [0.2.0]

- added both esnext and commonjs supports

## [0.1.4]

- fixed exports

## [0.1.3]

- updated exports
- updated README.md

## [0.1.2]

- updated exports

## [0.1.1]

- added tests
- updated error handling
- removed unused interceptor

## [0.1.0]

- Added setAccessToken and setRefreshToken methods to save in local storage
- improved internal handling of baseUrl
