import assert from "node:assert/strict";
import test from "node:test";
import { parseArgs } from "../src/args.js";

/** Helper to construct null-prototype expected objects matching parseArgs flags */
function nullProto(obj) {
  return Object.assign(Object.create(null), obj);
}

// ---------------------------------------------------------------------------
// Happy Paths — Flags & Values
// ---------------------------------------------------------------------------

test("parseArgs handles empty argv array", () => {
  const result = parseArgs([]);
  assert.deepEqual(result.flags, nullProto({}));
  assert.deepEqual(result.positionals, []);
  assert.equal(Object.getPrototypeOf(result.flags), null);
});

test("parseArgs parses boolean flags", () => {
  const result = parseArgs(["--overwrite", "--merge"]);
  assert.deepEqual(result.flags, nullProto({ overwrite: true, merge: true }));
  assert.deepEqual(result.positionals, []);
});

test("parseArgs parses key=value flags (equals syntax)", () => {
  const result = parseArgs(["--templates=node,react", "--output=.gitignore"]);
  assert.deepEqual(
    result.flags,
    nullProto({
      templates: "node,react",
      output: ".gitignore"
    })
  );
  assert.deepEqual(result.positionals, []);
});

test("parseArgs parses key value flags (space syntax)", () => {
  const result = parseArgs(["--templates", "node,react", "--output", "./custom/.gitignore"]);
  assert.deepEqual(
    result.flags,
    nullProto({
      templates: "node,react",
      output: "./custom/.gitignore"
    })
  );
  assert.deepEqual(result.positionals, []);
});

// ---------------------------------------------------------------------------
// Happy Paths — Short Aliases
// ---------------------------------------------------------------------------

test("parseArgs maps short aliases correctly", () => {
  assert.deepEqual(parseArgs(["-v"]).flags, nullProto({ version: true }));
  assert.deepEqual(parseArgs(["-h"]).flags, nullProto({ help: true }));
  assert.deepEqual(parseArgs(["-l"]).flags, nullProto({ list: true }));
  assert.deepEqual(parseArgs(["-y"]).flags, nullProto({ yes: true }));
});

test("parseArgs supports unmapped short aliases", () => {
  assert.deepEqual(parseArgs(["-k"]).flags, nullProto({ k: true }));
});

// ---------------------------------------------------------------------------
// Edge Cases & Combinations
// ---------------------------------------------------------------------------

test("parseArgs treats flag at end of array as boolean", () => {
  const result = parseArgs(["--templates"]);
  assert.deepEqual(result.flags, nullProto({ templates: true }));
});

test("parseArgs handles flag followed immediately by another flag", () => {
  const result = parseArgs(["--templates", "--overwrite"]);
  assert.deepEqual(result.flags, nullProto({ templates: true, overwrite: true }));
});

test("parseArgs preserves values containing multiple equals signs", () => {
  const result = parseArgs(["--output=foo=bar"]);
  assert.deepEqual(result.flags, nullProto({ output: "foo=bar" }));
});

test("parseArgs parses mixed flags and positionals", () => {
  const result = parseArgs(["--templates=node", "extraArg1", "-y", "extraArg2"]);
  assert.deepEqual(result.flags, nullProto({ templates: "node", yes: true }));
  assert.deepEqual(result.positionals, ["extraArg1", "extraArg2"]);
});

// ---------------------------------------------------------------------------
// Security & Prototype Pollution Guards
// ---------------------------------------------------------------------------

test("parseArgs ignores __proto__ flag (equals syntax)", () => {
  const result = parseArgs(["--__proto__=polluted"]);
  assert.equal(Object.hasOwn(result.flags, "__proto__"), false);
  assert.equal(Object.prototype.polluted, undefined);
});

test("parseArgs ignores constructor flag", () => {
  const result = parseArgs(["--constructor=polluted"]);
  assert.equal(result.flags.constructor, undefined);
});

test("parseArgs ignores prototype flag", () => {
  const result = parseArgs(["--prototype=polluted"]);
  assert.equal(result.flags.prototype, undefined);
});

test("parseArgs ignores __proto__ flag (space syntax)", () => {
  const result = parseArgs(["--__proto__", "polluted"]);
  assert.equal(Object.hasOwn(result.flags, "__proto__"), false);
  assert.equal(Object.prototype.polluted, undefined);
});
