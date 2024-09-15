import { Octokit } from "@octokit/rest";
import { MetadataNode, Model } from "./atoms";
import matter from "gray-matter";

// const TOPICS = {
//   general: "基础",
//   nipple: "乳首",
//   prostate: "前列腺",
//   penis: "阴茎",
//   hypnosis: "催眠",
//   squirting: "潮吹",
// };

const TOPICS = [
  "general",
  "nipple",
  "prostate",
  "penis",
  "hypnosis",
  "squirting",
];

const base = {
  owner: "viva-la-vita",
  repo: "wiki2",
};

export default class API {
  private octokit: Octokit;
  private rest: Octokit["rest"];

  constructor() {
    this.octokit = new Octokit({
      auth: import.meta.env.PAT,
    });
    this.rest = this.octokit.rest;
  }

  async initialize() {
    const { data } = await this.rest.git.getTree({
      ...base,
      tree_sha: "main",
      recursive: "true",
    });
    const files: MetadataNode[] = [];
    for (const { type, path, sha } of data.tree) {
      if (type !== "blob") continue;
      if (!path || !sha) continue;
      if (path.startsWith("docs/") && path.endsWith(".mdx")) {
        const pathList = path.split("/").slice(1);
        if (pathList.length < 2) continue;
        files.push({ path: pathList, sha });
      }
    }

    return await this.createModel(files);
  }

  async createModel(files: MetadataNode[]) {
    const model = new Model();
    const descendants: MetadataNode[] = [];
    // 第一遍找到所有根节点
    for (const { path, sha } of files) {
      if (path.length === 2 && path.at(-1)! === "index.mdx") {
        const { title, content } = await this.getFileWithSHA(sha);
        model.push({
          name: path[0],
          title,
          sha,
          content,
          expanded: false,
          unknown_children: [],
          children: [],
        });
      } else {
        descendants.push({ path, sha });
      }
    }
    model.sort((a, b) => TOPICS.indexOf(a.name) - TOPICS.indexOf(b.name));
    // 第二遍找到所有子节点，并且归类放置到根节点下
    for (const { path, sha } of descendants) {
      const root = model.find((node) => node.name === path[0]!);
      if (!root) continue;
      root.unknown_children.push({
        path: path.slice(1),
        sha,
      });
    }
    return model;
  }

  async getFileWithSHA(sha: string) {
    const res = await this.rest.git.getBlob({
      ...base,
      file_sha: sha,
    });
    const binString = atob(res.data.content);
    const bin = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
    const decoder = new TextDecoder();
    const text = decoder.decode(bin);
    const { data, content } = matter(text);
    return {
      title: data.title ?? "无标题",
      sidebar_position: data.sidebar_position ?? 0,
      content,
    };
  }
}
