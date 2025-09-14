# Playmatic GitHub Action

[![CI](https://github.com/playmaticai/playmatic-action/actions/workflows/ci.yml/badge.svg)](https://github.com/playmaticai/playmatic-action/actions/workflows/ci.yml)
[![Check dist](https://github.com/playmaticai/playmatic-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/playmaticai/playmatic-action/actions/workflows/check-dist.yml)
[![code analysis](https://github.com/playmaticai/playmatic-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/playmaticai/playmatic-action/actions/workflows/codeql-analysis.yml)

A GitHub Action to run Playmatic E2E tests using the CLI. Tests are executed locally in the GitHub Actions runner with results displayed directly in your workflow logs.

## Features

- **Local execution**: Tests run in GitHub Actions runner (no remote dependencies)
- **Environment support**: Use any environment from your `playmatic.config.ts`
- **URL overrides**: Dynamic base URL support for preview deployments
- **Video recordings**: Recording URLs displayed in workflow output
- **Full CLI output**: Complete test results visible in GitHub logs

## Prerequisites

- **playmatic.config.ts**: Your repository must have a Playmatic configuration file
- **@playmatic/sdk**: Install as dev dependency in your project
- **API key**: Playmatic API key stored in GitHub Secrets

## Usage

### On pushes to a branch

This workflow runs Playmatic tests after code is pushed to specific branches.

```yaml
# .github/workflows/playmatic.yml
name: Playmatic E2E Tests
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run Playmatic tests
        uses: playmaticai/playmatic-action@v1
        with:
          api-key: ${{ secrets.PLAYMATIC_API_KEY }}
          environment: 'staging'  # Change to match your playmatic.config.ts
          test-paths: 'playmatic-tests'  # Change if tests are in different directory
          # base-url-override: ${{ github.event.deployment.url }}  # Uncomment for preview deployments
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `api-key` | Your Playmatic API key | Yes | - |
| `environment` | Environment from playmatic.config.ts | No | `staging` |
| `base-url-override` | Override baseUrl for this run | No | - |
| `test-paths` | Test files/directories to run | No | `playmatic-tests` |
| `cli-version` | Playmatic CLI version to use | No | `0.1.5` |

## Outputs

| Output | Description |
|--------|-------------|
| `success` | Whether tests passed (true/false) |

## Setup

### 1. Install Playmatic SDK

Add the SDK to your project:

```bash
npm install -D @playmatic/sdk
```

### 2. Create API Key

Get your API key from the Playmatic dashboard and add it to your repository secrets:

**Repository Settings** → **Secrets and variables** → **Actions** → **New repository secret**

- **Name**: `PLAYMATIC_API_KEY`
- **Value**: Your Playmatic API key

### 3. Configuration File

Ensure you have a `playmatic.config.ts` file in your repository:

```typescript
export default {
  cacheSettings: {
    actionTimeout: 10000,
  },
  defaultEnv: "development",
  env: {
    development: {
      baseUrl: "http://localhost:3000",
      vars: {
        API_KEY: process.env.API_KEY || "dev-key",
      },
    },
    staging: {
      baseUrl: "https://staging.yourapp.com",
      vars: {
        API_KEY: process.env.STAGING_API_KEY,
      },
    },
    production: {
      baseUrl: "https://yourapp.com",
      vars: {
        API_KEY: process.env.PROD_API_KEY,
      },
    },
  },
};
```

## Migration from v0.x

**v1.0.0 is a breaking change** from the API-based v0.x versions:

- **Local execution**: Tests now run in GitHub Actions instead of remote servers
- **Configuration required**: Must have `playmatic.config.ts` in repository  
- **Environment-based**: Uses environment system instead of direct URLs
- **New inputs**: Use `environment` instead of `test-url`

## Contributing

This section contains information for developing and contributing to this action.

### Initial Setup

After you've cloned the repository to your local machine or codespace, you'll
need to perform some initial setup steps before you can develop your action.

1. :hammer_and_wrench: Install the dependencies

   ```bash
   pnpm install
   ```

1. :building_construction: Package the TypeScript for distribution

   ```bash
   pnpm run bundle
   ```

### Developing

The [`src/`](./src/) directory is the heart of your action!

There are a few things to keep in mind when writing your action code:

* Most GitHub Actions toolkit and CI/CD operations are processed asynchronously.
  In `main.ts`, you will see that the action is run in an `async` function.

  ```javascript
  import * as core from '@actions/core'
  //...

  async function run() {
    try {
      //...
    } catch (error) {
      core.setFailed(error.message)
    }
  }
  ```

  For more information about the GitHub Actions toolkit, see the
  [documentation](https://github.com/actions/toolkit/blob/master/README.md).

So, what are you waiting for? Go ahead and start customizing your action!

1. Create a new branch

   ```bash
   git checkout -b releases/v1
   ```

1. Replace the contents of `src/` with your action code
1. Add tests to `__tests__/` for your source code
1. Format, test, and build the action

   ```bash
   npm run all
   ```

   > This step is important! It will run [`rollup`](https://rollupjs.org/) to
   > build the final JavaScript action code with all dependencies included. If
   > you do not run this step, your action will not work correctly when it is
   > used in a workflow.

1. (Optional) Test your action locally

   The [`@github/local-action`](https://github.com/github/local-action) utility
   can be used to test your action locally. It is a simple command-line tool
   that "stubs" (or simulates) the GitHub Actions Toolkit. This way, you can run
   your TypeScript action locally without having to commit and push your changes
   to a repository.

   The `local-action` utility can be run in the following ways:

   * Visual Studio Code Debugger

     Make sure to review and, if needed, update
     [`.vscode/launch.json`](./.vscode/launch.json)

   * Terminal/Command Prompt

     ```bash
     # npx @github/local action <action-yaml-path> <entrypoint> <dotenv-file>
     npx @github/local-action . src/main.ts .env
     ```

   You can provide a `.env` file to the `local-action` CLI to set environment
   variables used by the GitHub Actions Toolkit. For example, setting inputs and
   event payload data used by your action. For more information, see the example
   file, [`.env.example`](./.env.example), and the
   [GitHub Actions Documentation](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables).

1. Commit your changes

   ```bash
   git add .
   git commit -m "My first action is ready!"
   ```

1. Push them to your repository

   ```bash
   git push -u origin releases/v1
   ```

1. Create a pull request and get feedback on your action
1. Merge the pull request into the `main` branch

Your action is now published! :rocket:

For information about versioning your action, see
[Versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
in the GitHub Actions toolkit.

### Publishing a New Release

This project includes a helper script, for releasing, simply commit the new version and run `bash scripts/release`.