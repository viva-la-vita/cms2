import { Octokit } from "@octokit/rest";
import { mainBranch, MetadataNode, Model, TreeNode } from "./atoms";
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
  public ready: boolean = false;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
    });
    this.rest = this.octokit.rest;
    this.ready = token !== "";
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
    const nodes = await this.expand(content, []);
    return new Model(nodes);
  }

  async expand(files: (MetadataNode | string)[], parentPath: string[]) {
    const map = new Map<number, TreeNode>();
    const futures = files.map((x, index) => {
      const { name, items } =
        typeof x === "string" ? { name: x, items: [] } : x;
      const basename =
        typeof x === "string" ? `${name}.mdx` : `${name}/index.mdx`;
      const path = ["docs", ...parentPath, basename].join("/");
      return this.getFileWithPath(path).then(({ title, content }) => {
        map.set(index, {
          name,
          title,
          content,
          expanded: false,
          unknown_items: items,
          items: [],
        });
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

  async getFileWithPath(path: string) {
    const res = await this.rest.repos.getContent({
      ...base,
      path,
    });
    if (!("type" in res.data && res.data.type === "file")) throw new Error();
    return this.parseFile(res.data.content);
  }

  async getFileWithSHA(sha: string) {
    const res = await this.rest.git.getBlob({
      ...base,
      file_sha: sha,
    });
    return this.parseFile(res.data.content);
  }
}
