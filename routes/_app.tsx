import { type PageProps } from "$fresh/server.ts";
export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>dep_graph</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body class="max-w-screen-lg mx-auto">
        <Component />
      </body>
    </html>
  );
}
