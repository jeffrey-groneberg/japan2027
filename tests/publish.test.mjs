import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const tree = "a".repeat(40);
const source = "b".repeat(40);
const parent = "c".repeat(40);
const revision = "d".repeat(40);

function publishWithMocks(options = {}) {
  const directory = mkdtempSync(join(tmpdir(), "japan-pages-test-"));
  const log = join(directory, "commands.jsonl");
  const program = `#!/usr/bin/env node
const fs = require("node:fs");
const tool = require("node:path").basename(process.argv[1]);
const args = process.argv.slice(2);
fs.appendFileSync(process.env.MOCK_LOG, JSON.stringify({tool,args}) + "\\n");
if (tool === "git") {
  if (args[0] === "status") process.stdout.write(process.env.MOCK_DIRTY || "");
  else if (args[0] === "rev-parse") console.log(args[1] === "HEAD" ? "${source}" : "${tree}");
  else if (args[0] === "ls-remote") console.log(process.env.MOCK_EXISTING ? "${parent}\\trefs/heads/gh-pages" : "");
  else if (args[0] === "fetch") {}
  else if (args[0] === "log") console.log("Source change\\n\\nCo-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>\\nCopilot-Session: test-session");
  else if (args[0] === "commit-tree") console.log("${revision}");
  else if (args[0] === "push") {}
  else throw new Error("Unexpected git command");
} else if (args[0] === "repo") {
  console.log(JSON.stringify({nameWithOwner:"owner/repo"}));
} else if (process.env.MOCK_AUTO && fs.readFileSync(process.env.MOCK_LOG,"utf8").includes('"push"')) {
  console.log(JSON.stringify({build_type:"legacy",source:{branch:"gh-pages",path:"/"},html_url:"https://owner.github.io/repo/"}));
} else if (args.includes("POST")) {
  console.log(JSON.stringify({html_url:"https://owner.github.io/repo/"}));
} else if (process.env.MOCK_PAGES) {
  console.log(process.env.MOCK_PAGES);
} else {
  console.log(JSON.stringify({status:"404",message:"Not Found"}));
  process.stderr.write("gh: Not Found (HTTP 404)");
  process.exitCode=1;
}`;
  for (const tool of ["git", "gh"]) writeFileSync(join(directory, tool), program, { mode: 0o755 });
  try {
    const result = spawnSync(process.execPath, [new URL("../scripts/publish-pages.mjs", import.meta.url).pathname], {
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${directory}:${process.env.PATH}`,
        MOCK_LOG: log,
        MOCK_DIRTY: options.dirty ?? "",
        MOCK_PAGES: options.pages ? JSON.stringify(options.pages) : "",
        MOCK_EXISTING: options.existing ? "1" : "",
        MOCK_AUTO: options.auto ? "1" : "",
      },
    });

    test("GitHub automatically enabling Pages after the first gh-pages push is a success, not a duplicate-creation failure", () => {
      const result = publishWithMocks({ auto: true });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.commands.some((entry) => entry.args.includes("POST")), false);
      assert.match(result.stdout, /Publication requested|publication requested/);
    });
    if (result.error) throw result.error;
    const commands = readFileSync(log, "utf8").trim().split("\n").map((line) => JSON.parse(line));
    return { ...result, commands };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("first publication uses only the committed site tree and creates a new Pages configuration", () => {
  const result = publishWithMocks();
  assert.equal(result.status, 0, result.stderr);
  const commit = result.commands.find((entry) => entry.args[0] === "commit-tree");
  assert.equal(commit.args[1], tree);
  assert.equal(commit.args.includes("-p"), false);
  assert.match(commit.args.at(-1), /Co-authored-by: Copilot App/);
  assert.match(commit.args.at(-1), /Copilot-Session: test-session/);
  assert.ok(result.commands.some((entry) => entry.tool === "gh" && entry.args.includes("POST")));
  assert.ok(result.commands.some((entry) => entry.tool === "git" && entry.args[0] === "push" && entry.args.includes(`${revision}:refs/heads/gh-pages`)));
  assert.equal(result.commands.some((entry) => entry.args.includes("--force") || entry.args.includes("checkout") || entry.args.includes("subtree")), false);
});

test("updates parent their site-only commit to the current remote deployment without changing Pages settings", () => {
  const result = publishWithMocks({ existing: true, pages: { build_type: "legacy", source: { branch: "gh-pages", path: "/" }, html_url: "https://owner.github.io/repo/" } });
  assert.equal(result.status, 0, result.stderr);
  const commit = result.commands.find((entry) => entry.args[0] === "commit-tree");
  assert.deepEqual(commit.args.slice(0, 4), ["commit-tree", tree, "-p", parent]);
  assert.ok(result.commands.some((entry) => entry.args[0] === "fetch"));
  assert.equal(result.commands.some((entry) => entry.args.includes("POST")), false);
});

test("uncommitted site changes and unrelated existing Pages configurations block publication", () => {
  for (const options of [
    { dirty: " M site/app.js" },
    { pages: { build_type: "workflow" } },
    { pages: { build_type: "legacy", source: { branch: "main", path: "/docs" } } },
  ]) {
    const result = publishWithMocks(options);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Publication failed/);
    assert.equal(result.commands.some((entry) => ["commit-tree", "push"].includes(entry.args[0]) || entry.args.includes("POST")), false);
  }
});
