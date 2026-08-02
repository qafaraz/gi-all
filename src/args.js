/**
 * Minimal, zero-dependency argv parser.
 * Supports:
 *   --flag            boolean true
 *   --flag value      string value
 *   --flag=value      string value
 *   -f                short alias
 *
 * @param {string[]} argv  process.argv.slice(2)
 * @returns {{ flags: Record<string, string|boolean>, positionals: string[] }}
 */
function parseArgs(argv) {
  const flags = Object.create(null);
  const positionals = [];
  const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);
  let i = 0;

  const setFlag = (key, value) => {
    if (!DANGEROUS_KEYS.has(key)) {
      flags[key] = value;
    }
  };

  while (i < argv.length) {
    const arg = argv[i];

    if (arg.startsWith("--")) {
      const eqIdx = arg.indexOf("=");
      if (eqIdx !== -1) {
        setFlag(arg.slice(2, eqIdx), arg.slice(eqIdx + 1));
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
        setFlag(arg.slice(2), argv[i + 1]);
        i += 1;
      } else {
        setFlag(arg.slice(2), true);
      }
    } else if (arg.startsWith("-") && arg.length === 2) {
      const aliases = { v: "version", h: "help", y: "yes", l: "list" };
      const key = aliases[arg[1]] ?? arg[1];
      setFlag(key, true);
    } else {
      positionals.push(arg);
    }

    i += 1;
  }

  return { flags, positionals };
}

export { parseArgs };
