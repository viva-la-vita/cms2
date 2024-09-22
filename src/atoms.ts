import { atom } from "jotai";
import API from "./api";
import { Buffer } from "buffer";
import { atomWithImmer } from "jotai-immer";
import { immerable } from "immer";

window.Buffer = window.Buffer || Buffer;

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
  original_path: string;
  title: string;
  content: string;
  expanded: boolean;
  unknown_items: (MetadataNode | string)[];
  items: TreeNode[];
}

export interface Draft {
  name: string;
  title: string;
  content: string;
  hash: string;
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

const makeAPI = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (token && user) return new API(token, user);
  return null;
};

export const apiAtom = atom<API | null>(makeAPI());

export const draftAtom = atom<Draft | null>(null);
