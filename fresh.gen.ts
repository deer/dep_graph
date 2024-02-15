// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $api_analyze_deps from "./routes/api/analyze_deps.ts";
import * as $index from "./routes/index.tsx";
import * as $DependencyGraph from "./islands/DependencyGraph.tsx";
import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/api/analyze_deps.ts": $api_analyze_deps,
    "./routes/index.tsx": $index,
  },
  islands: {
    "./islands/DependencyGraph.tsx": $DependencyGraph,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
