import { test, testStep } from "@playmatic/sdk";

test("Playmatic Waitlist Calendar Loads", () => {
  testStep("Navigate to Playmatic.ai", async ({ page }) => {
    // The cached test code will pass, and computer use will not be needed
    await page.goto("https://playmatic2222.ai");
  }, { cacheOnly: true});

  testStep("Click the button to join the waitlist", async ({ page }) => {
    // The cached test code here will fail and fall back to computer use
    await page.click('button:has-text("Join waitlist")');
  });

  // This is a pure computer use step with no caching
  testStep("Choose the first available date and stop");
});
