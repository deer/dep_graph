import { Handlers } from "$fresh/server.ts";
import {
  createGraph,
  ModuleGraphJson,
} from "https://deno.land/x/deno_graph@0.69.6/mod.ts";
import { Edge, Node } from "../../utils/types.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const module = url.searchParams.get("module");
    const maxNodes = Number.parseInt(
      url.searchParams.get("maxNodes") ?? "100",
      10,
    );
    const numberOfLayers = Number.parseInt(
      url.searchParams.get("numberOfLayers") ?? "2",
      10,
    );
    if (!module) {
      return new Response(
        JSON.stringify({ error: "Module parameter is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    console.log({ module, maxNodes, numberOfLayers });
    try {
      const moduleURL = new URL(module);
      if (!["http:", "https:", "file:"].includes(moduleURL.protocol)) {
        return new Response(
          JSON.stringify({
            error: "Only http(s) and file protocols are supported.",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    } catch (error) {
      if (error instanceof TypeError) {
        return new Response(
          JSON.stringify({ error: "Invalid module URL" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    function getDependencies(
      moduleSpecifier: string,
      currentLayer: number,
      graph: ModuleGraphJson,
      visited = new Set<string>(),
    ): Node[] {
      if (currentLayer > numberOfLayers || visited.has(moduleSpecifier)) {
        return [];
      }
      visited.add(moduleSpecifier);

      const module = graph.modules.find((m) => m.specifier === moduleSpecifier);
      if (!module) return [];

      const nodes: Node[] = [{
        id: module.specifier,
        label: module.specifier.split("/").pop() ?? module.specifier,
      }];

      if (module.dependencies) {
        module.dependencies.forEach((dep) => {
          if (dep.code && dep.code.specifier) {
            nodes.push(
              ...getDependencies(
                dep.code.specifier,
                currentLayer + 1,
                graph,
                visited,
              ),
            );
          }
        });
      }

      return nodes;
    }

    try {
      const graph = await createGraph([module]);
      // console.log(graph);

      const nodes = getDependencies(module, 1, graph).slice(0, maxNodes);

      const edges: Edge[] = [];
      nodes.forEach((node) => {
        const module = graph.modules.find((m) => m.specifier === node.id);
        module?.dependencies?.forEach((dep) => {
          if (!dep.code) return;
          if (!dep.code.specifier) return;
          if (nodes.some((n) => n.id === dep.code!.specifier)) {
            const edge = {
              id: `${node.id}-${dep.code.specifier}`,
              from: node.id,
              to: dep.code.specifier,
              arrows: "to",
            };
            edges.push(edge);
          }
        });
      });

      return new Response(JSON.stringify({ nodes, edges }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error(error);
      return new Response(
        JSON.stringify({ error: "Failed to analyze dependencies" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
};
