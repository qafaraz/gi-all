#!/usr/bin/env node

// Thin entrypoint that delegates to the new modular CLI implementation.
import pc from "picocolors";
import { run } from "../src/cli.js";

run().catch((err) => {
  console.error(pc.red("Unexpected error in gi-all:"));
  console.error(err);
  process.exitCode = 1;
});
