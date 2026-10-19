import { execFileSync, spawnSync } from "node:child_process";

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();
}

function gh(...args) {
  return execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();
}

function existingPages(repo) {
  const result = spawnSync("gh", ["api", `repos/${repo}/pages`], { encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status === 0) return JSON.parse(result.stdout);
  let response;
  try {
    response = JSON.parse(result.stdout);
  } catch {
    throw new Error(`Could not read GitHub Pages settings: ${result.stderr.trim()}`);
  }
  if (String(response.status) === "404") return null;
  throw new Error(`Could not read GitHub Pages settings: ${result.stderr.trim()}`);
}

function publish() {
  if (git("status", "--porcelain", "--untracked-files=all", "--", "site")) {
    throw new Error("Commit all changes under site/ before publishing. Only committed content is deployed.");
  }
  const { nameWithOwner: repo } = JSON.parse(gh("repo", "view", "--json", "nameWithOwner"));
  const pages = existingPages(repo);
  if (pages && (pages.build_type !== "legacy" || pages.source?.branch !== "gh-pages" || pages.source?.path !== "/")) {
    throw new Error("This repository uses different Pages publishing settings. Review them before changing the deployed site; no settings were overwritten.");
  }
  const sourceRevision = git("rev-parse", "HEAD");
  const tree = git("rev-parse", "HEAD:site");
  const remote = git("ls-remote", "--heads", "origin", "refs/heads/gh-pages");
  let parent;
  if (remote) {
    parent = remote.split(/\s+/)[0];
    if (!/^[a-f0-9]{40}$/.test(parent)) throw new Error("Git did not return a valid remote site revision.");
    git("fetch", "--quiet", "origin", "refs/heads/gh-pages");
  }
  const trailers = git("log", "-1", "--format=%B").split("\n")
    .filter((line) => /^(Co-authored-by|Copilot-Session):/.test(line));
  const message = `Publish Japan & Vietnam 2027\n\nSource-Commit: ${sourceRevision}\n\n${trailers.join("\n")}`;
  const revision = git("commit-tree", tree, ...(parent ? ["-p", parent] : []), "-m", message);
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error("Git did not return a valid site revision.");
  git("push", "origin", `${revision}:refs/heads/gh-pages`);
  const configuration = pages ?? JSON.parse(gh(
    "api", "--method", "POST", `repos/${repo}/pages`,
    "-f", "build_type=legacy", "-f", "source[branch]=gh-pages", "-f", "source[path]=/",
  ));
  console.log(`GitHub Pages publication requested: ${configuration.html_url}`);
  console.log("The gh-pages branch contains only site/. GitHub may take a few minutes to finish deployment.");
}

try {
  publish();
} catch (error) {
  console.error(`Publication failed: ${error.message}`);
  process.exitCode = 1;
}
