# Change Log

## [0.3.0] Note: This version has breaking changes.

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

