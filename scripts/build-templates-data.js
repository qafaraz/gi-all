// build-templates-data.js — run via: npm run build:templates
const fs = require("fs");
const path = require("path");

// Project root is one level up from scripts/
const ROOT = path.resolve(__dirname, "..");
const TEMPLATES_DIR = path.join(ROOT, "templates");
const OUT_FILE = path.join(ROOT, "assets", "js", "templates-data.js");

function inferCategory(filename) {
  const lower = filename.toLowerCase();
  const inName = (n) => lower.includes(n);

  if (inName("react") || inName("next") || inName("nuxt") || inName("vue") ||
      inName("svelte") || inName("angular") || inName("astro") || inName("remix") ||
      inName("gatsby") || inName("webpack") || inName("vite") || inName("tailwind") ||
      inName("story") || inName("qwik") || inName("solid") || inName("preact") ||
      inName("ember") || inName("backbone") || inName("aurelia") || inName("marko") ||
      inName("lit-") || inName("htmx") || inName("alpine") || inName("stencil") ||
      inName("parcel") || inName("rollup") || inName("turbo") || inName("sveltekit") ||
      inName("vuepress") || inName("gridsome") || inName("nuxtjs") || inName("blitz"))
    return "Frontend";

  if (inName("node") || inName("express") || inName("nest") || inName("laravel") ||
      inName("symfony") || inName("django") || inName("flask") || inName("spring") ||
      inName("rails") || inName("phoenix") || inName("adonis") || inName("fastapi") ||
      inName("trpc") || inName("hono") || inName("elysia") || inName("java") ||
      inName("kotlin") || inName("scala") || inName("gradle") || inName("maven") ||
      inName("rust") || inName("golang") || inName("-go") || lower === "go.gitignore" ||
      inName("python") || inName("ruby") || inName("perl") || inName("php") ||
      inName("elixir") || inName("erlang") || inName("haskell") || inName("ocaml") ||
      inName("clojure") || inName("fsharp") || inName("csharp") || inName("dotnet") ||
      inName(".net") || inName("aspnet") || inName("grails") || inName("ktor") ||
      inName("micronaut") || inName("quarkus") || inName("helidon") || inName("slim") ||
      inName("sinatra") || inName("tornado") || inName("fastify") || inName("koa") ||
      inName("gin") || inName("fiber") || inName("actix") || inName("axum") ||
      inName("yii") || inName("zend") || inName("laminas") || inName("codeigniter") ||
      inName("cakephp") || inName("silverstripe") || inName("drupal") || inName("typo3") ||
      inName("wordpress") || inName("joomla") || inName("magento") || inName("shopware") ||
      inName("sugarcrm") || inName("woocommerce") || inName("seamgen") || inName("moodle") ||
      inName("strapi") || inName("payload") || inName("keystonejs") || inName("sanity") ||
      inName("supabase") || inName("appwrite") || inName("pocketbase") || inName("convex"))
    return "Backend";

  if (inName("android") || inName("ios") || inName("flutter") || inName("react-native") ||
      inName("nativescript") || inName("ionic") || inName("capacitor") || inName("tizen") ||
      inName("xamarin") || inName("maui") || inName("swift") || inName("xcode") ||
      inName("expo") || inName("corona") || inName("cocos2d") || inName("phonegap") ||
      inName("cordova") || inName("appcelerator"))
    return "Mobile";

  if (inName("docker") || inName("kubernetes") || inName("helm") || inName("terraform") ||
      inName("ansible") || inName("serverless") || inName("vercel") || inName("netlify") ||
      inName("railway") || inName("cloudflare") || inName("vagrant") || inName("packer") ||
      inName("synology") || inName("devops") || inName("jenkins") || inName("travis") ||
      inName("circleci") || inName("github-action") || inName("gitlab") || inName("tekton") ||
      inName("argo") || inName("flux") || inName("pulumi") || inName("crossplane") ||
      inName("puppet") || inName("chef") || inName("saltstack") || inName("nomad") ||
      inName("consul") || inName("vault") || inName("istio") || inName("linkerd") ||
      inName("prometheus") || inName("grafana") || inName("kibana") || inName("elastic") ||
      inName("logstash") || inName("fluentd") || inName("datadog") || inName("sentry") ||
      inName("newrelic") || inName("buildkite") || inName("drone") || inName("concourse") ||
      inName("spinnaker") || inName("waypoint") || inName("boundary") || inName("warp-terminal") ||
      inName("render") || inName("heroku") || inName("fly.io") || inName("linode") ||
      inName("digitalocean") || inName("aws") || inName("azure") || inName("gcp"))
    return "DevOps & Cloud";

  if (inName("vscode") || inName("visualstudio-code") || inName("visualstudio") ||
      inName("webstorm") || inName("intellij") || inName("jetbrains") || inName("vim") ||
      inName("emacs") || inName("sublime") || inName("eclipse") || inName("netbeans") ||
      inName("codeblocks") || inName("codelite") || inName("kdevelop") || inName("atom") ||
      inName("slickedit") || inName("komodo") || inName("geany") || inName("brackets") ||
      inName("textmate") || inName("bbedit") || inName("notepad") || inName("cursor") ||
      inName("fleet") || inName("helix") || inName("zed") || inName("lapce") ||
      inName("kate") || inName("neovim") || inName("android-studio"))
    return "IDE & Editor";

  if (inName("postgres") || inName("mysql") || inName("sqlite") || inName("redis") ||
      inName("mongo") || inName("mssql") || inName("database") || inName("oracle") ||
      inName("cassandra") || inName("cockroach") || inName("mariadb") || inName("couchdb") ||
      inName("dynamodb") || inName("firestore") || inName("neo4j") || inName("influx") ||
      inName("timescale") || inName("clickhouse") || inName("duckdb") || inName("turso"))
    return "Database";

  if (inName("unity") || inName("unreal") || inName("godot") || inName("game") ||
      inName("flaxengine") || inName("monogame") || inName("pico-8") || inName("cocos") ||
      inName("lumberyard") || inName("cryengine") || inName("construct") || inName("pygame") ||
      inName("phaser") || inName("twine") || inName("rpgmaker") || inName("tic-80") ||
      inName("panda3d") || inName("defold") || inName("ogre") || inName("allegro") ||
      inName("sfml") || inName("sdl") || inName("opengl") || inName("vulkan") ||
      inName("directx") || inName("webgl") || inName("spine") || inName("tiled") ||
      inName("stella") || inName("love2d"))
    return "Game & 3D";

  if (inName("latex") || inName("matlab") || inName("jupyter") || inName("wolfram") ||
      inName("scientific") || inName("bioinformatics") || inName("r-language") ||
      inName("rstudio") || inName("octave") || inName("spss") || inName("stata") ||
      inName("sas-") || inName("tensorflow") || inName("pytorch") || inName("keras") ||
      inName("spark") || inName("hadoop") || inName("airflow") || inName("dbt") ||
      inName("scilab") || inName("openscad"))
    return "Data & Science";

  if (inName("linux") || inName("windows") || inName("macos") || inName("osx") ||
      inName("ubuntu") || inName("debian") || inName("fedora") || inName("arch") ||
      inName("freebsd") || inName("openbsd") || inName("bootdisk"))
    return "OS";

  if (inName("secret") || inName("ssh-key") || inName("credentials") || inName("sensitive") ||
      inName("security") || inName("key"))
    return "Security";

  return "Other";
}

function toDisplayName(filename) {
  return filename
    .replace(/\.gitignore$/, "")
    .replace(/-/g, " ")
    .replace(/\band\b/g, "&")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    // Fix some known acronyms
    .replace(/\bJs\b/g, "JS")
    .replace(/\bTs\b/g, "TS")
    .replace(/\bCss\b/g, "CSS")
    .replace(/\bHtml\b/g, "HTML")
    .replace(/\bPhp\b/g, "PHP")
    .replace(/\bSql\b/g, "SQL")
    .replace(/\bApi\b/g, "API")
    .replace(/\bIde\b/g, "IDE")
    .replace(/\bCi\b/g, "CI")
    .replace(/\bCd\b/g, "CD")
    .replace(/\bVm\b/g, "VM")
    .replace(/\bOs\b/g, "OS")
    .replace(/\bMl\b/g, "ML")
    .replace(/\bAi\b/g, "AI")
    .replace(/\bDb\b/g, "DB")
    .replace(/\bIot\b/g, "IoT")
    .replace(/\bRtos\b/g, "RTOS")
    .replace(/\bGpu\b/g, "GPU")
    .replace(/\bVr\b/g, "VR")
    .replace(/\bAr\b/g, "AR")
    .replace(/\bXr\b/g, "XR")
    .replace(/\bUi\b/g, "UI")
    .replace(/\bUx\b/g, "UX")
    .replace(/\bSvn\b/g, "SVN")
    .replace(/\bCms\b/g, "CMS")
    .replace(/\bErp\b/g, "ERP")
    .replace(/\bCrm\b/g, "CRM")
    .replace(/\bSdk\b/g, "SDK")
    .replace(/\bNpm\b/g, "npm")
    .replace(/\bYarn\b/g, "Yarn")
    .replace(/\bPnpm\b/g, "pnpm")
    .replace(/\bVscode\b/g, "VS Code")
    .replace(/\bVsix\b/g, "VSIX");
}

// Collect all .gitignore files
const files = fs.readdirSync(TEMPLATES_DIR)
  .filter(f => f.endsWith(".gitignore"))
  .sort();

console.log(`Found ${files.length} templates`);

const templates = files.map(filename => {
  const id = filename.replace(/\.gitignore$/, "");
  const name = toDisplayName(filename);
  const category = inferCategory(filename);
  const content = fs.readFileSync(path.join(TEMPLATES_DIR, filename), "utf8")
    .replace(/\r\n/g, "\n")  // normalize CRLF → LF
    .trim();
  return { id, name, category, content };
});

// Build JS output
const allCategories = [
  "All", "Frontend", "Backend", "Mobile", "DevOps & Cloud",
  "IDE & Editor", "OS", "Database", "Game & 3D", "Data & Science", "Security", "Other"
];

let out = `// gi-all template data — auto-generated by build-templates-data.js
// ${templates.length} templates across ${allCategories.length - 1} categories
// biome-ignore lint/correctness/noUnusedVariables: used as global in main.js
const TEMPLATES = [\n`;

for (const t of templates) {
  const escapedContent = t.content
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
  out += `  {\n`;
  out += `    id: ${JSON.stringify(t.id)},\n`;
  out += `    name: ${JSON.stringify(t.name)},\n`;
  out += `    category: ${JSON.stringify(t.category)},\n`;
  out += `    content: \`${escapedContent}\`,\n`;
  out += `  },\n`;
}

out += `];\n\n`;

out += `// biome-ignore lint/correctness/noUnusedVariables: used as global in main.js\n`;
out += `const CATEGORIES = ${JSON.stringify(allCategories)};\n\n`;

out += `// Safety rules always appended\n`;
out += `// biome-ignore lint/correctness/noUnusedVariables: used as global in main.js\n`;
out += `const SAFETY_RULES = \`\n`;
out += `# ── Security: secrets & credentials ──────────────────────────────────────────\n`;
out += `.env\n.env.*\n!.env.example\n!.env.sample\n`;
out += `*.pem\n*.key\n*.p12\n*.p8\n*.cert\n*.crt\n*.pfx\n*.jks\n`;
out += `id_rsa\nid_dsa\nid_ecdsa\nid_ed25519\n*.ppk\n.ssh/\n`;
out += `# Config files with secrets\nsecrets.json\nsecrets.yml\nsecrets.yaml\n`;
out += `credentials.json\ncredentials.yml\nserviceAccountKey.json\n`;
out += `firebase-service-account.json\n*.secret\n`;
out += `# Tokens and API keys\n.npmrc\n.yarnrc\n.netrc\n`;
out += `# Cloud provider config\n.aws/credentials\n.gcloud/\ngcloud_credentials.json\`;\n`;

fs.writeFileSync(OUT_FILE, out, "utf8");
console.log(`Written: ${OUT_FILE}`);
console.log(`Total templates: ${templates.length}`);

// Category breakdown
const counts = {};
for (const t of templates) {
  counts[t.category] = (counts[t.category] || 0) + 1;
}
console.log("Category breakdown:");
for (const [cat, count] of Object.entries(counts).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${cat}: ${count}`);
}
