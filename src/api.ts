import { Octokit } from "@octokit/rest";
import { Draft, mainBranch, MetadataNode, Model, TreeNode } from "./atoms";
import matter from "gray-matter";

const base = {
  owner: "viva-la-vita",
  repo: "wiki2",
};

const decode = (base64: string) => {
  const binString = atob(base64);
  const bin = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
  const decoder = new TextDecoder();
  return decoder.decode(bin);
};

export default class API {
  private octokit: Octokit;
  private rest: Octokit["rest"];
  private user: string;

  constructor(token: string, user: string) {
    this.user = user;
    this.octokit = new Octokit({
      auth: token,
    });
    this.rest = this.octokit.rest;
  }

  async getPullRequests() {
    const { data } = await this.rest.pulls.list({
      ...base,
      state: "open",
    });
    return data;
  }

  async createPullRequest(branch: string) {
    const { data } = await this.rest.pulls.create({
      ...base,
      title: `Update ${branch}`,
      head: branch,
      base: mainBranch,
    });
    return data;
  }

  async getBranches() {
    const { data } = await this.rest.repos.listBranches({
      ...base,
    });
    return data.map((x) => x.name);
  }

  async createBranch(name: string) {
    const { data } = await this.rest.repos.getBranch({
      ...base,
      branch: mainBranch,
    });
    const sha = data.commit.sha;
    await this.rest.git.createRef({
      ...base,
      ref: `refs/heads/${name}`,
      sha,
    });
  }

  async initialize(branch: string) {
    const { data } = await this.rest.repos.getContent({
      ...base,
      ref: branch,
      path: "sidebars.json",
    });
    if (!("type" in data && data.type === "file")) throw new Error();
    const content: MetadataNode[] = JSON.parse(decode(data.content));
    const nodes = await this.expand(branch, content, []);
    return new Model(nodes);
  }

  async expand(branch: string, files: MetadataNode[], parentPath: string[]) {
    const map = new Map<number, TreeNode>();
    const futures = files.map(async ({ name, items }, index) => {
      const basename = `${name}/index.mdx`;
      const path = ["docs", ...parentPath, basename].join("/");
      const { title, content } = await this.getFileWithPath(branch, path);
      map.set(index, {
        name,
        title,
        content,
        expanded: false,
        unknown_items: items,
        items: [],
      });
    });
    await Promise.all(futures);
    return files.map((_, index) => map.get(index)!);
  }

  async parseFile(base64: string) {
    const text = decode(base64);
    const { data, content } = matter(text);
    return {
      title: (data.title as string) ?? "无标题",
      content,
    };
  }

  async dumpFile(title: string, content: string) {
    const text = matter.stringify(content, { title });
    const bin = new TextEncoder().encode(text);
    const base64 = btoa(String.fromCharCode(...bin));
    return base64;
  }

  async getFileWithPath(branch: string, path: string) {
    const { data } = await this.rest.repos.getContent({
      ...base,
      ref: branch,
      path,
    });
    if (!("type" in data && data.type === "file")) throw new Error();
    return this.parseFile(data.content);
  }

  async updateFileWithPath(path: string[], draft: Draft) {
    const original_path = ["docs", ...path, "index.mdx"].join("/");
    const { data } = await this.rest.repos.getContent({
      ...base,
      ref: this.user,
      path: original_path,
    });
    if (!("type" in data && data.type === "file")) throw new Error();
    const { name, title, content } = draft;
    const base64 = await this.dumpFile(title, content);
    const new_path = [...path];
    if (name !== path.at(-1)) {
      await this.rest.repos.deleteFile({
        ...base,
        branch: this.user,
        path: original_path,
        message: `Delete ${original_path}`,
        sha: data.sha,
      });
      new_path[new_path.length - 1] = name;
    }
    const new_original_path = ["docs", ...new_path, "index.mdx"].join("/");
    await this.rest.repos.createOrUpdateFileContents({
      ...base,
      branch: this.user,
      path: new_original_path,
      message: `Update ${new_original_path}`,
      content: base64,
      sha: data.sha,
    });
    return new_path;
  }
}
