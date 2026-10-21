import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const extensions = new Set([".js", ".json", ".png", ".webp", ".jpg", ".jpeg",
    ".svg", ".ico", ".ttf", ".woff", ".woff2"]);
const files = ["index.html", "style.css", "manifest.webmanifest"];

async function collect(directory) {
    for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
        const relative = `${directory}/${entry.name}`;
        if (entry.isDirectory()) await collect(relative);
        else if (entry.isFile() && extensions.has(path.extname(entry.name))) files.push(relative);
    }
}
for (const directory of ["js", "data", "imgs", "fonts", "icons"]) await collect(directory);
files.sort();

const workerPath = path.join(root, "sw.js");
const worker = await readFile(workerPath, "utf8");
const versionPattern = /const BUILD_VERSION = "[^"]+";/;
if (!versionPattern.test(worker)) throw new Error("Service worker version declaration missing");
const hash = createHash("sha256");
hash.update(worker.replace(versionPattern, 'const BUILD_VERSION = "";'));
for (const file of files) {
    hash.update(file);
    hash.update(await readFile(path.join(root, file)));
}
const version = hash.digest("hex").slice(0, 16);
const assets = files.map((file) => "./" + file.split("/").map(encodeURIComponent).join("/"));
await writeFile(path.join(root, "offline-assets.json"),
    JSON.stringify({ version, assets }, null, 2) + "\n");
await writeFile(workerPath, worker.replace(versionPattern, `const BUILD_VERSION = "${version}";`));
console.log(`Offline version ${version}: ${assets.length} files`);
