export interface Node {
  id: number | string;
  label: string;
}

export interface Edge {
  id?: number | string;
  from: number | string;
  to: number | string;
  arrows: string;
}
