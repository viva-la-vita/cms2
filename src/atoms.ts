import { atom } from "jotai";
import API from "./api";
import { Buffer } from "buffer";
import { atomWithImmer } from "jotai-immer";
import { immerable } from "immer";
import { atomWithStorage } from "jotai/utils";

window.Buffer = window.Buffer || Buffer;

export const tokenAtom = atomWithStorage("token", localStorage.getItem("token") ?? "");

export const userAtom = atomWithStorage("user", localStorage.getItem("user") ?? "");

export const mainBranch = "main";

export const branchAtom = atom(mainBranch);

export const pathAtom = atom<string[]>([]);

export const sidebarAtom = atom(false);

export interface MetadataNode {
  name: string;
  items: (MetadataNode | string)[];
}

export interface TreeNode {
  name: string;
  title: string;
  content: string;
  expanded: boolean;
  unknown_items: (MetadataNode | string)[];
  items: TreeNode[];
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
      pointer = node.items;
    }
    return node;
  }

  set(path: string[], index: number, node: TreeNode) {
    let pointer: TreeNode[] = this.data;
    for (const name of path) {
      const child = pointer.find((child) => child.name === name);
      if (!child) return;
      pointer = child.items;
    }
    pointer[index] = node;
  }
}

export const modelAtom = atomWithImmer<Model>(new Model());

export const apiAtom = atom((get) => new API(get(tokenAtom)));
