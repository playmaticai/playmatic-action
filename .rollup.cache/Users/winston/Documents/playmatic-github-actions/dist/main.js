import * as core from "@actions/core";
import * as github from "@actions/github";
const PLAYMATIC_API_ENDPOINT = process.env.PLAYMATIC_API_URL ||
    "https://app.playmatic.ai/api/v1/trigger-test";
/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run() {
    try {
        const apiKey = core.getInput("api-key", { required: true });
        const testUrl = core.getInput("test-url") || undefined;
        const environmentId = core.getInput("environment-id") || undefined;
        if (!testUrl && !environmentId) {
            core.setFailed("Either 'test-url' or 'environment-id' must be provided.");
            return;
        }
        core.debug("Inputs received:");
        core.debug("API Key: ****");
        if (testUrl)
            core.debug(`Test URL: ${testUrl}`);
        if (environmentId)
            core.debug(`Environment ID: ${environmentId}`);
        const body = {};
        const repoName = github.context.repo.repo;
        const commitSha = github.context.eventName === "pull_request" ||
            github.context.eventName === "pull_request_target"
            ? github.context.payload.pull_request?.head?.sha
            : github.context.sha;
        const owner = github.context.repo.owner;
        const pullRequestNumber = github.context.payload.pull_request?.number;
        core.debug(`Event Name: ${github.context.eventName}`);
        core.debug(`Payload: ${JSON.stringify(github.context.payload)}`);
        const ref = github.context.eventName === "pull_request" ||
            github.context.eventName === "pull_request_target"
            ? github.context.payload.pull_request?.head?.ref
            : github.context.ref;
        if (testUrl)
            body.entrypointUrl = testUrl;
        if (environmentId)
            body.environmentId = environmentId;
        if (repoName)
            body.repoName = repoName;
        if (owner)
            body.repoOwner = owner;
        if (commitSha)
            body.commitSha = commitSha;
        if (pullRequestNumber)
            body.pullRequestNumber = pullRequestNumber;
        if (ref)
            body.ref = ref;
        core.debug(`Request Body: ${JSON.stringify(body)}`);
        const response = await fetch(PLAYMATIC_API_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorData = (await response.json());
            core.setFailed(`API request failed with status ${response.status}: ${errorData.error}`);
            return;
        }
        const responseData = (await response.json());
        if (responseData?.outputUrl) {
            core.setOutput("outputUrl", responseData.outputUrl);
            core.info(`Playtest successfully initiated: ${responseData.outputUrl}`);
        }
        else {
            core.setFailed("Failed to get playtest URL from API response or response did not match expected format.");
        }
    }
    catch (error) {
        // Fail the workflow run if an error occurs
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed("An unknown error occurred.");
        }
    }
}
//# sourceMappingURL=main.js.map