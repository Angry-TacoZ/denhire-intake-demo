import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const rules = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  [
    "provider credential",
    /\b(?:sk-[A-Za-z0-9_-]{20,}|AIza[A-Za-z0-9_-]{30,}|AKIA[A-Z0-9]{16}|gh[pousr]_[A-Za-z0-9]{30,})\b/,
  ],
  [
    "network API call",
    /\b(?:fetch\s*\(|XMLHttpRequest|WebSocket\s*\(|sendBeacon\s*\()/,
  ],
  [
    "persistent browser storage",
    /\b(?:localStorage|sessionStorage|indexedDB)\b/,
  ],
];
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? files(path)
      : /\.(tsx?|jsx?|css|html)$/.test(path)
        ? [path]
        : [];
  });
}
const failures = [];
for (const file of [...files("src"), ...files("dist")]) {
  const content = readFileSync(file, "utf8");
  for (const [name, pattern] of rules) {
    if (pattern.test(content)) failures.push(`${file}: ${name}`);
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    "PASS: source and built demo contain no recognized credential patterns, network API calls, or persistent browser storage.",
  );
