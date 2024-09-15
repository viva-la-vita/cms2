import { atom } from "jotai";
import API from "./api";
import { Buffer } from "buffer";

window.Buffer = window.Buffer || Buffer;

export const pathAtom = atom<string[]>([]);

export interface MetadataNode {
  path: string[];
  sha: string;
}

export interface TreeNode {
  name: string;
  title: string;
  sha: string;
  content: string;
  expanded: boolean;
  unknown_children: MetadataNode[];
  children: TreeNode[];
}

export class Model extends Array<TreeNode> {
  constructor() {
    super();
  }

  get(path: string[]): TreeNode | undefined {
    let node: TreeNode | undefined = undefined;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let pointer: TreeNode[] = this;
    for (const name of path) {
      node = pointer.find((child) => child.name === name);
      if (!node) return;
      pointer = node.children;
    }
    return node;
  }
}

export const modelAtom = atom<Model>(new Model());

export const api = new API();
