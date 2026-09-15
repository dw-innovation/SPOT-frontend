// maplibre-gl's ESM build derives its worker URL from import.meta.url, which
// is not an http(s) URL under Next's bundler, so the worker never starts.
// Serve the worker (and the shared chunk it imports) as static files instead;
// see registerPmtilesProtocol() in src/components/map/protomapsStyle.ts.
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const dist = dirname(require.resolve("maplibre-gl/dist/maplibre-gl.mjs"));
const out = join(process.cwd(), "public", "maplibre");

mkdirSync(out, { recursive: true });
for (const f of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(join(dist, f), join(out, f));
}
