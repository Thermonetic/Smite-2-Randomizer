// Resolve assets from the app folder, including GitHub Pages repository paths.
const appRoot = new URL("../", import.meta.url);

export function assetUrl(path) {
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    return new URL(encodedPath, appRoot).href;
}
