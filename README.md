# Playmatic GitHub Action

[![CI](https://github.com/playmaticai/playtest-action/actions/workflows/ci.yml/badge.svg)](https://github.com/playmaticai/playtest-action/actions/workflows/ci.yml)
[![Check dist](https://github.com/playmaticai/playtest-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/playmaticai/playtest-action/actions/workflows/check-dist.yml)
[![Check dist](https://github.com/playmaticai/playtest-action/actions/workflows/linter.yml/badge.svg)](https://github.com/playmaticai/playtest-action/actions/workflows/linter.yml)
[![Check dist](https://github.com/playmaticai/playtest-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/playmaticai/playtest-action/actions/workflows/codeql-analysis.yml)

## Usage

To use this action, add the following step to your GitHub Actions workflow file (e.g., `.github/workflows/main.yml`). This action is typically run after a preview deployment has been created.

### 1. Get Preview URL

First, you need a step in your job that generates a preview URL. For Vercel, you can use an action like `patrickedqvist/wait-for-vercel-preview` to wait for the deployment to be ready and get the URL.

```yaml
jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
    - name: Waiting for 200 from the Vercel Preview
    outputs:
      url: https://example.com
```

### 2. Run Playmatic Playtest

Next, add a job that depends on the preview deployment job and runs the playtest.

```yaml
  start-playmatic:
    runs-on: ubuntu-latest
    needs: preview
    steps:
    - name: Playmatic playtest
      uses: playmaticai/playtest-action@v0.0.3
      with:
        api-key: ${{ secrets.PLAYMATIC_API_KEY }}
        test-url: ${{ needs.preview.outputs.url }}
```

### 3. Configure API Key

You will need to add your Playmatic API key as a secret to your GitHub repository.

You can do so from [the app](https://app.playmatic.ai/) under settings.

## Inputs

| Name       | Required | Description                                                                                                                              |
| ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `api-key`  | `true`   | Your Playmatic API key.                                                                                                                  |
| `test-url` | `true`   | The URL of the deployment to test. This should be the full URL to the page where the playtest should start (e.g. a login page).            |

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

This project includes a helper script, [`script/release`](./script/release)
designed to streamline the process of tagging and pushing new releases for
GitHub Actions.

GitHub Actions allows users to select a specific version of the action to use,
based on release tags. This script simplifies this process by performing the
following steps:

1. **Retrieving the latest release tag:** The script starts by fetching the most
   recent SemVer release tag of the current branch, by looking at the local data
   available in your repository.
1. **Prompting for a new release tag:** The user is then prompted to enter a new
   release tag. To assist with this, the script displays the tag retrieved in
   the previous step, and validates the format of the inputted tag (vX.X.X). The
   user is also reminded to update the version field in package.json.
1. **Tagging the new release:** The script then tags a new release and syncs the
   separate major tag (e.g. v1, v2) with the new release tag (e.g. v1.0.0,
   v2.1.2). When the user is creating a new major release, the script
   auto-detects this and creates a `releases/v#` branch for the previous major
   version.
1. **Pushing changes to remote:** Finally, the script pushes the necessary
   commits, tags and branches to the remote repository. From here, you will need
   to create a new release in GitHub so users can easily reference the new tags
   in their workflows.
