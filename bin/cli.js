#!/usr/bin/env node

// Thin entrypoint that delegates to the new modular CLI implementation.
require("../src/cli")
  .run()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
