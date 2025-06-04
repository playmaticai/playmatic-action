import * as core from "@actions/core";
// Define a constant for the Playmatic API endpoint
const PLAYMATIC_API_ENDPOINT = "https://api.playmatic.ai/v1/playtests"; // This can be made configurable if needed
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
        // Validate that either test-url or environment-id is present
        if (!testUrl && !environmentId) {
            core.setFailed("Either 'test-url' or 'environment-id' must be provided.");
            return;
        }
        core.debug("Inputs received:");
        core.debug("API Key: ****"); // Mask API key in logs
        if (testUrl)
            core.debug(`Test URL: ${testUrl}`);
        if (environmentId)
            core.debug(`Environment ID: ${environmentId}`);
        const body = {};
        if (testUrl)
            body.entrypointUrl = testUrl;
        if (environmentId)
            body.environmentId = environmentId;
        core.debug(`Request body: ${JSON.stringify(body)}`);
        const response = await fetch(PLAYMATIC_API_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorText = await response.text();
            core.setFailed(`API request failed with status ${response.status}: ${errorText}`);
            return;
        }
        const responseData = (await response.json());
        if (responseData?.playtestUrl) {
            core.setOutput("playtest-link", responseData.playtestUrl);
            core.info(`Playtest successfully initiated: ${responseData.playtestUrl}`);
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