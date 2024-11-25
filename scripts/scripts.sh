# Format and lint via ESLint and Prettier
npm run format && npm run lint && npx prettier --check --write .

# Publish to npm with test
npm run testPublish

# Publish dev version to npm
npm run testPublish:dev