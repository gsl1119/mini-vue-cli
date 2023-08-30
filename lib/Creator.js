const { fetchRepoList, fetchTagList } = require("./request");
const { sleep, warpLoading } = require("./utils");
const Inquirer = require("inquirer");
const downloadGitRepo = require("download-git-repo"); // 不支持promise
const util = require("util");
const path = require("path");
class Creator {
  constructor(projectName, targetDir) {
    // new的时候会调用构造函数
    this.name = projectName;
    this.target = targetDir;
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }
  async fetchRepo() {
    // 失败重新拉取
    let repos = await warpLoading(fetchRepoList, "waiting fetch template");
    if (!repos) return;
    repos = repos.map((item) => item.name);
    let { repo } = await Inquirer.prompt({
      name: "repo",
      type: "list",
      choices: repos,
      message: `please choose a template`,
    });
    return repo;
  }

  async fetchTag(repo) {
    let tags = await warpLoading(fetchTagList, "waiting fetch tags", repo);
    if (!tags) {
      return;
    }
    tags = tags.map((item) => item.name);
    let { tag } = await Inquirer.prompt({
      name: "tag",
      type: "list",
      choices: tags,
      message: "please choose a tag to create project",
    });
    return tag;
  }
  async download(repo, tag) {
    // 1.需要拼接出下载路径
    let requestUrl = `zhu-cli/${repo}${tag ? "#" + tag : ""}`;
    // 2.把资源下载到某一个路径(后续可以增加缓存功能，应该下载到系统目录中，稍后可以在使用ejs handlerbar 去渲染模板 最后生成结果写入)
    await warpLoading(
      this.downloadGitRepo(
        requestUrl,
        path.resolve(process.cwd(), `${repo}@${tag}`)
      ),
      "waiting to download"
    );
    return this.target;
  }
  async create() {
    // 1)先拉去当前组织下的模板
    let repo = await this.fetchRepo();
    // 2）再通过模板找到版本号
    let tag = await this.fetchTag(repo);
    console.log(repo, tag);
    // // 3）下载
    await this.download(repo, tag);
  }
}

module.exports = Creator;
