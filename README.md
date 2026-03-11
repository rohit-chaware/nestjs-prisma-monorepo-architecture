# Nestjs-Primsa-Multi-Lambda-Monorepo-Architecture

Monorepo architecture for multi-lambda functions with AWS CDK infrastructure and GitHub Actions CI/CD.

## Architecture

This project uses a monorepo structure with:

- **Lambda Functions**: Individual serverless functions in `lambdas/` directory
- **Infrastructure**: AWS CDK stack definitions in `infrastructure/` directory
- **CI/CD**: GitHub Actions workflows for automated deployment

## Project Structure

```
root/
├── lambdas/
├── lambda-functions    # Lambda function packages
├── shared/              # Shared packages
│   ├── types/           # Shared TypeScript types
│   ├── utils/           # Shared utility functions
│   ├── constants/       # Shared constants
├── infrastructure/       # CDK infrastructure code
│   ├── bin/             # CDK app entry point
│   └── lib/             # CDK stack definitions
├── .github/
│   └── workflows/       # GitHub Actions CI/CD workflows
└── package.json         # Root workspace configuration
```

## Prerequisites

- Node.js 20.x
- pnpm 8.x
- AWS CLI configured
- AWS CDK CLI installed globally: `npm install -g aws-cdk`

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Bootstrap CDK (first time only):
```bash
cd infrastructure
cdk bootstrap
```

## Development

### Build Lambda Functions

```bash
# Build all lambda functions
pnpm build:lambdas

# Build specific lambda
cd lambdas/lambda-function-x
pnpm build
```

### Build Infrastructure

```bash
pnpm build:infra
```

### Deploy

```bash
# Deploy to dev environment
pnpm deploy:dev

# Deploy to production
pnpm deploy:prod

# Synthesize CloudFormation template
pnpm synth

# View differences
pnpm diff
```

## Adding New Lambda Functions

1. Create a new directory in `lambdas/`:
```bash
mkdir -p lambdas/new-service/src
```

2. Create `package.json` and `tsconfig.json` (copy from existing service)

3. Add the service name to `infrastructure/lib/project-name-stack.ts` in the `functionNames` array

4. Implement your handler in `src/index.ts`

## CI/CD

The project includes GitHub Actions workflows:

- **CI** (`ci.yml`): Runs on PRs and pushes - linting, testing, and building
- **Deploy** (`deploy.yml`): Deploys to AWS based on branch:
  - `dev` branch → dev environment
  - `main` branch → production environment

### Required GitHub Secrets

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ACCOUNT_ID`

## Environment Variables

Lambda functions receive environment variables:
- `ENVIRONMENT`: dev or prod
- `NODE_ENV`: development or production

## Scripts

- `pnpm build` - Build all packages (shared, lambdas, infrastructure)
- `pnpm build:shared` - Build all shared packages
- `pnpm build:lambdas` - Build all lambda functions
- `pnpm build:infra` - Build infrastructure
- `pnpm deploy` - Deploy to default environment
- `pnpm deploy:dev` - Deploy to dev
- `pnpm deploy:prod` - Deploy to production
- `pnpm synth` - Synthesize CDK stack
- `pnpm diff` - Show CDK diff
- `pnpm lint` - Lint all code
- `pnpm test` - Run all tests

## Shared Packages

The monorepo includes shared packages that are used across all Lambda functions:

- **@project-name/shared-types** - Common TypeScript types and interfaces
- **@project-name/shared-utils** - Utility functions (response formatters, event parsers, validators, logger)
- **@project-name/shared-constants** - Shared constants and configuration

See [shared/README.md](./shared/README.md) for detailed documentation.

## License

UNLICENSED
