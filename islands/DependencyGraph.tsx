import { signal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { DataSet, Network } from "vis-network";
import { Edge, Node } from "../utils/types.ts";

const moduleName = signal("");
const maxNodes = signal(100);
const numberOfLayers = signal(3);

const nodes = new DataSet<Node>();
const edges = new DataSet<Edge>();

export default function DependencyGraph() {
  const container = useRef<HTMLDivElement>(null);
  const network = useRef<Network | null>(null);

  const analyzeDependencies = async () => {
    if (moduleName.value === "") {
      console.log("Module name is empty");
      return;
    }
    console.log({ moduleName: moduleName.value });
    const response = await fetch(
      `/api/analyze_deps?module=${
        encodeURIComponent(moduleName.value)
      }&maxNodes=${maxNodes.value}&numberOfLayers=${numberOfLayers.value}`,
    );
    if (response.ok) {
      const data = await response.json() as {
        nodes: Node[];
        edges: Edge[];
      };
      console.log(data);
      data.nodes.forEach((node) => {
        if (!nodes.get(node.id)) {
          nodes.add(node);
        }
      });
      data.edges.forEach((edge) => {
        if (!edges.get(edge.id!)) {
          edges.add(edge);
        }
      });
    } else {
      console.error("Failed to analyze dependencies");
    }
  };

  function clearGraph() {
    nodes.clear();
    edges.clear();
  }

  useEffect(() => {
    if (!container.current) return;
    const options = {
      layout: {
        hierarchical: {
          direction: "UD",
          sortMethod: "directed",
          shakeTowards: "roots",
        },
      },
    };
    network.current = new Network(container.current, {
      nodes: nodes,
      edges: edges,
    }, options);
  }, []);

  return (
    <div class="w-full pt-4 h-screen pb-10 flex flex-col">
      <div class="flex items-center">
        <input
          type="text"
          onInput={(event) => {
            if (event.target instanceof HTMLInputElement) {
              moduleName.value = event.target.value;
            }
          }}
          value={moduleName.value}
          placeholder="Enter a Deno module URL"
          class="m-4 p-2 border-2 border-gray-600 w-[500px]"
        />
        <button
          onClick={analyzeDependencies}
          class="m-4 p-2 border-2 border-gray-600"
        >
          Go
        </button>
        <div class="flex flex-col m-4 p-2 border-2 border-gray-600">
          <label for="maxNodes">Max Nodes</label>
          <input
            class="w-10"
            type="text"
            id="maxNodes"
            name="maxNodes"
            value={maxNodes.value}
            onInput={(event) => {
              if (event.target instanceof HTMLInputElement) {
                maxNodes.value = Number.parseInt(event.target.value, 10);
              }
            }}
          />
        </div>
        <div class="flex flex-col m-4 p-2 border-2 border-gray-600">
          <label for="numberOfLayers">Number of Layers</label>
          <input
            class="w-10"
            type="text"
            id="numberOfLayers"
            name="numberOfLayers"
            value={numberOfLayers.value}
            onInput={(event) => {
              if (event.target instanceof HTMLInputElement) {
                numberOfLayers.value = Number.parseInt(event.target.value, 10);
              }
            }}
          />
        </div>
        <button
          onClick={clearGraph}
          class="m-4 p-2 border-2 border-gray-600"
        >
          Clear Graph
        </button>
      </div>
      <div ref={container} className="w-full grow border-2 border-gray-600" />
    </div>
  );
}
