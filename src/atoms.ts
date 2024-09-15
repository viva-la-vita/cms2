import { atom } from "jotai";
import API from "./api";
import { Buffer } from "buffer";
import { atomWithImmer } from "jotai-immer";
import { immerable } from "immer";

window.Buffer = window.Buffer || Buffer;

export const pathAtom = atom<string[]>([]);

export const sidebarAtom = atom(false);

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

export class Model {
  [immerable] = true;
  data: TreeNode[];

  constructor(data: TreeNode[] = []) {
    this.data = data;
  }

  get(path: string[]): TreeNode | undefined {
    let node: TreeNode | undefined = undefined;
    let pointer: TreeNode[] = this.data;
    for (const name of path) {
      node = pointer.find((child) => child.name === name);
      if (!node) return;
      pointer = node.children;
    }
    return node;
  }

  set(path: string[], index: number, node: TreeNode) {
    let pointer: TreeNode[] = this.data;
    for (const name of path) {
      const child = pointer.find((child) => child.name === name);
      if (!child) return;
      pointer = child.children;
    }
    pointer[index] = node;
  }
}

export const modelAtom = atomWithImmer<Model>(new Model());

export const api = new API();
