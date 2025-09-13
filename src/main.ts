import * as core from "@actions/core";
import * as exec from "@actions/exec";

/**
 * The main function for the action.
 * Runs Playmatic E2E tests using the CLI
 */
export async function run(): Promise<void> {
  try {
    const apiKey = core.getInput("api-key", { required: true });
    const environment = core.getInput("environment");
    const baseUrlOverride = core.getInput("base-url-override");
    const testPaths = core.getInput("test-paths");
    const cliVersion = core.getInput("cli-version");

    core.info("Starting Playmatic E2E tests...");
    core.debug(`Environment: ${environment}`);
    core.debug(`Test paths: ${testPaths}`);
    core.debug(`CLI version: ${cliVersion}`);
    if (baseUrlOverride) {
      core.debug(`Base URL override: ${baseUrlOverride}`);
    }

    // 1. Set API key environment variable
    core.exportVariable("PLAYMATIC_API_KEY", apiKey);

    // 2. Build CLI command using npx (no global installation needed)
    const args = [
      `playmatic@${cliVersion}`,
      "run",
      testPaths,
      "--env",
      environment,
    ];
    if (baseUrlOverride) {
      args.push("--base-url", baseUrlOverride);
    }

    // 3. Execute Playmatic CLI via npx
    core.info(`Running: npx ${args.join(" ")}`);
    await exec.exec("npx", args);

    core.info("✅ Playmatic tests completed successfully");
    core.setOutput("success", "true");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    core.error(`❌ Playmatic tests failed: ${errorMessage}`);
    core.setOutput("success", "false");
    core.setFailed(errorMessage);
  }
}

// Run the action
run();
