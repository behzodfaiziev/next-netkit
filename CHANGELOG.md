# Changelog

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
  baseUrl: 'https://api.example.com', // Production base URL
  devBaseUrl: 'https://dev.example.com', // Development base URL
  testMode: false, // Test mode: false (production), true (development)
  baseOptions: {}, // Axios config options
  errorParams: networkErrorParams, // Error parameters
  isClientSideWeb: typeof window !== 'undefined' && typeof localStorage !== 'undefined'
});
```

`Deprecated` usage:

```typescript
const networkManager = new NetworkManager(
        'https://api.example.com', // Production base URL
        'https://dev.example.com', // Development base URL
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

