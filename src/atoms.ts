import { atom } from "jotai";
import API from "./api";
import { Buffer } from "buffer";
import { atomWithImmer } from "jotai-immer";
import { immerable } from "immer";

window.Buffer = window.Buffer || Buffer;

export interface MetadataNode {
  name: string;
  items: MetadataNode[];
}

export interface TreeNode {
  name: string;
  title: string;
  content: string;
  expanded: boolean;
  unknown_items: MetadataNode[];
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
    let node: TreeNode | undefined;
    let pointer: TreeNode[] = this.data;
    for (const name of path) {
      node = pointer.find((child) => child.name === name);
      if (!node) return;
      pointer = node.items;
    }
    return node;
  }

  set(path: string[], new_node: TreeNode) {
    let node: TreeNode | undefined;
    let pointer: TreeNode[] = this.data;
    for (const name of path.slice(0, -1)) {
      node = pointer.find((child) => child.name === name);
      if (!node) return;
      pointer = node.items;
    }
    const name = path.at(-1);
    const index = pointer.findIndex((child) => child.name === name);
    if (index === -1) return;
    pointer[index] = new_node;
  }
}

const makeAPI = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (token && user) return new API(token, user);
  return null;
};

export const mainBranch = "main";

export const sidebarAtom = atom(false);

export const apiAtom = atom<API | null>(makeAPI());

export const branchAtom = atom(mainBranch);

export const modelAtom = atomWithImmer<Model>(new Model());

export const pathAtom = atom<string[]>([]);

export const draftAtom = atom<Draft>({
  name: "",
  title: "",
  content: "",
  hash: "",
});
