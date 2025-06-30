# Playmatic GitHub Action

[![CI](https://github.com/playmaticai/playmatic-action/actions/workflows/ci.yml/badge.svg)](https://github.com/playmaticai/playmatic-action/actions/workflows/ci.yml)
[![Check dist](https://github.com/playmaticai/playmatic-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/playmaticai/playmatic-action/actions/workflows/check-dist.yml)
[![code analysis](https://github.com/playmaticai/playmatic-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/playmaticai/playmatic-action/actions/workflows/codeql-analysis.yml)

## Usage

To use this action, add one of the following example workflows to your repository in a file like `.github/workflows/playmatic.yml`.

### On new Pull Requests

This workflow runs a Playmatic test on preview deployments for new pull requests. This is useful for catching issues before they are merged into your main branch. This example is for Vercel, but can be adapted for other hosting providers that generate preview URLs.

```yaml
# .github/workflows/playmatic-pr.yml
name: Playmatic Test Run
on:
  # On new PRs opened with these branches as the destination, the test will run.
  pull_request:
    branches: ["main"]
  merge_group:

jobs:
  # This job waits for the preview deployment to be ready and outputs its URL.
  # This is an example job for Vercel specifically. Use a different job if you are not using Vercel.
  preview:
    runs-on: ubuntu-latest
    steps:
    - name: Waiting for 200 from the Vercel Preview
      id: preview
      uses: patrickedqvist/wait-for-vercel-preview@v1.3.1
      with:
        # This is automatically populated by GitHub, you do not need to add this secret
        token: ${{ secrets.GITHUB_TOKEN }}
        max_timeout: 600
    outputs:
      url: ${{ steps.preview.outputs.url }}
    
  # This job runs the Playmatic test on a branch's preview deployment.
  start-playmatic:
    runs-on: ubuntu-latest
    needs: preview
    steps:
    - name: Playmatic tests
      uses: playmaticai/playmatic-action@v0.0.8
      with:
        # This can be retrieved from the "Settings" page on the Playmatic dashboard.
        api-key: ${{ secrets.PLAYMATIC_API_KEY }}
        # Use the output from the 'preview' job.
        # If not using a preview job, you can provide the preview URL directly.
        test-url: ${{ needs.preview.outputs.url }}
```

### On pushes to a branch

This workflow runs a Playmatic test after code is pushed to a specific branch.

```yaml
# .github/workflows/playmatic-push.yml
name: Playmatic Test Run
on:
  push:
    # On new commits to these branches, the test will run.
    branches:
      - main

jobs:    
  # This job runs the Playmatic test on URL provided in the "test-url" field.
  # The latest commit will be used to determine what to test.
  start-playmatic:
    runs-on: ubuntu-latest
    steps:
    - name: Playmatic tests
      uses: playmaticai/playmatic-action@v0.0.8
      with:
        # This can be retrieved from the "Settings" page on the Playmatic dashboard.
        api-key: ${{ secrets.PLAYMATIC_API_KEY }}
        # The URL of the deployment. This should always be a test environment (e.g. staging)
        # Note that you might have to introduce some delay if your code need to be built and deployed after being merged to the branch
        test-url: "https://link-to-your-staging-environment.com"
```

## Configuration

### API Key

You will need to add your Playmatic API key as a secret to your GitHub repository. You can get a key from [the app](https://app.playmatic.ai/) under settings.

### Inputs

| Name       | Required | Description                                                                                                                              |
| ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `api-key`  | `true`   | Your Playmatic API. Grab this from the settings page. key.                                                                                                                  |
| `test-url` | `true`   | The URL of the deployment to test. This should be the full URL to the page where the playmatic tests should start (e.g. a login page).            |
| `run-all-saved-tests` | `false` | Whether to run all saved tests. Defaults to `true`. |
| `run-exploratory-test` | `false` | Whether to run an exploratory test based on changes made in the PR/commit. Defaults to `true`. |

## Example

* Vercel: [`examples/vercel.yml`](./examples/vercel.yml).
* More coming soon! Please reach out to us if you are unsure on how to configure testing for any environment.

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
