export default {
  cacheSettings: {
    actionTimeout: 10000,
  },

  // This is the environment that will be used if no --env is provided when running
  // Learn more about environments and variables in the docs: https://docs.playmatic.ai/creating-tests/writing-a-test
  defaultEnv: "development",
  env: {
    development: {
      baseUrl: "http://localhost:3000",
      vars: {
        // Add your test variables here
        // API_KEY: process.env.API_KEY || "dev-key",
      },
    },
    staging: {
      baseUrl: "https://staging.your-app.com",
      vars: {
        // Add your test variables here
        // API_KEY: process.env.API_KEY || "staging-key",
      },
    },
    production: {
      baseUrl: "https://your-app.com",
      vars: {
        // Add your test variables here
        // API_KEY: process.env.API_KEY || "prod-key",
      },
    },
  },
};