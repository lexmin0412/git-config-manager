---
name: release
description: 基于 Changesets 的 Monorepo 发布流程。当用户说"发布"、"发版"、"release"、"publish"、"升级版本"、"发一个版本"、"bump version"、"npm 发布"时使用此技能。即使用户只是简单地说"发布一下"也必须触发。
---

# Release Skill

基于 Changesets 的 Monorepo 发布流程，AI 驱动。

## 项目结构

- `@lexmin0412/gcm` (cli) - CLI 工具，发布到 npm
- `@lexmin0412/gcm-api` (api) - API 包，发布到 npm
- `gcm-vscode` (vsc-ext) - VSCode 插件，发布到 VSCode Marketplace，被 changeset ignore

**版本同步策略**：四个包版本号保持一致，但发布渠道不同：
- 根目录 package.json → 版本号同步
- api + cli → npm（通过 changeset）
- vsc-ext → VSCode Marketplace（通过 vsce publish）

**linked 配置说明**：`gcm` 和 `gcm-api` 是 linked 关系，任一有 changeset → 两者都会发版。通常只需要给实际改动的包写 changeset。

## 核心约束

1. **禁止自动提交**：每次 `git commit` / `git push` 前必须向用户展示内容并等待确认
2. **分步执行**：每步完成后报告结果，确认无误再进入下一步
3. **必须在 master 分支**：不在则停止，不询问
4. **npm 登录检查**：Step 0 必须验证，否则后续回退成本高
5. **Beta 优先**：正式发布前必须先发 beta 验证
6. **版本号同步**：根目录 + api + cli + vsc-ext 四个版本必须一致

## 前置知识

### pnpm + vsce 兼容性问题

vsce 官方不支持 pnpm，`npm list` 命令会因 pnpm 符号链接而失败。

**解决方案**：用 esbuild bundle + `--no-dependencies`

vsc-ext 的 package.json scripts 应配置为：
```json
{
  "scripts": {
    "vscode:prepublish": "pnpm run bundle",
    "bundle": "esbuild ./src/extension.ts --bundle --outfile=out/extension.js --external:vscode --format=cjs --platform=node --minify",
    "package": "pnpm vsce package --no-dependencies",
    "publish": "pnpm vsce publish --no-dependencies"
  }
}
```

### workspace 依赖处理

vsc-ext 的 `@lexmin0412/gcm-api` 不能用 `workspace:*`，要用固定 npm 版本号：
```json
{
  "dependencies": {
    "@lexmin0412/gcm-api": "1.10.0"  // 不能用 workspace:*
  }
}
```

### npm 2FA 问题

- 用 `npm whoami` 检查登录状态
- 如需 OTP，提前准备认证器或 Access Token
- Access Token 设置：`npm config set //registry.npmjs.org/:_authToken <token>`

## 发布流程

### Step 0: 环境检查

```bash
git status                          # 检查工作区是否干净
git branch --show-current           # 必须在 master
npm whoami                          # 检查 npm 登录状态
git log --oneline -10               # 展示最近 commit
```

- 工作区不干净 → 提醒用户先处理，停止
- 不在 master → 停止，提示切换分支
- npm 未登录 → 停止，提示 `npm login`
- npm 开启 2FA → 提示需要提供 `--otp <code>` 或设置 Access Token

### Step 1: 状态检测

**先检测是否有"已 bump 未 publish"的状态**：

```bash
# 获取远程版本
npm view @lexmin0412/gcm version
npm view @lexmin0412/gcm-api version

# 获取本地版本（精确匹配 package.json 中的 version 字段）
node -e "console.log(require('./packages/cli/package.json').version)"
node -e "console.log(require('./packages/api/package.json').version)"
node -e "console.log(require('./package.json').version)"  # 根目录也要检查
```

判断逻辑：
- **本地 > 远程** → 说明已 bump 但未 publish，直接跳到 Step 4
- **本地 == 远程 且有 changeset** → 走正常流程
- **本地 == 远程 且无 changeset** → 分析 git log 判断是否有待发布变更

### Step 2: 收集变更

检查是否有待发布的 changeset 文件：

```bash
ls .changeset/*.md 2>/dev/null | grep -v README.md
```

**如果没有 changeset**：

1. 分析 git log（上次 tag 到 HEAD）
2. 判断哪些包有变更（根据改动文件路径）：
   - `packages/cli/**` → `@lexmin0412/gcm`
   - `packages/api/**` → `@lexmin0412/gcm-api`
   - `packages/vsc-ext/**` → `gcm-vscode`（需单独处理）
3. 直接创建 `.changeset/xxx.md` 文件（不使用交互式 `npx changeset`，AI 环境可能无 TTY）

Changeset 文件格式：
```md
---
"@lexmin0412/gcm": minor
"@lexmin0412/gcm-api": minor
---

添加了 XXX 功能
```

版本规则：
- `patch`：bug 修复、文档、重构、chore
- `minor`：新功能
- `major`：Breaking Change

### Step 3: 构建 & 版本升级

```bash
# 构建
pnpm build

# 版本升级（consumes changeset 文件）
npx changeset version

# 同步 lockfile
pnpm install

# 同步根目录版本号
node -e "
const pkg = require('./package.json');
const cliPkg = require('./packages/cli/package.json');
pkg.version = cliPkg.version;
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"
```

**执行后展示变更摘要**：
```bash
git diff --stat
git diff "**/CHANGELOG.md"
```

等待用户确认。

> 注意：`config.json` 中 `"commit": false`，所以 version 之后改动是 unstaged 的，需要手动 commit。

### Step 4: Beta 发布（必须）

**正式发布前必须先发 beta 验证**，避免有问题的包发布到 latest。

#### 4.1 进入 beta 模式

```bash
npx changeset pre enter beta
```

#### 4.2 构建 & beta 版本升级

```bash
pnpm build
npx changeset version
pnpm install
```

此时版本号会变成 `1.10.0-beta.0`。

#### 4.3 提交 beta 版本

```bash
git add -A
git status  # 展示变更，等待用户确认
git commit -m "chore(release): beta v<版本号>-beta.0"
git tag v<版本号>-beta.0
```

#### 4.4 发布 beta 到 npm

```bash
# 发布到 npm 的 beta tag（不会影响 latest）
npx changeset publish --tag beta

# 推送
git push && git push --tags
```

#### 4.5 验证 beta

```bash
# 检查 beta 版本
npm view @lexmin0412/gcm dist-tags

# 安装测试
npm install -g @lexmin0412/gcm@beta
gcm --version
gcm list --json
```

**等待用户确认 beta 验证通过**。如果有问题，执行 [Beta 回退流程](#beta-回退)。

### Step 5: 正式发布

**确认 beta 验证通过后**，退出 beta 模式并发布正式版。

#### 5.1 退出 beta 模式

```bash
npx changeset pre exit
```

#### 5.2 重新版本升级（生成正式版本号）

```bash
npx changeset version
pnpm install

# 同步根目录版本号
node -e "
const pkg = require('./package.json');
const cliPkg = require('./packages/cli/package.json');
pkg.version = cliPkg.version;
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"
```

#### 5.3 提交 & 发布正式版

```bash
# 展示将要提交的内容
git add -A
git status

# 等待用户确认后
git commit -m "chore(release): publish v<新版本号>"
git tag v<新版本号>

# dry-run 检查版本不存在
npm view @lexmin0412/gcm@<新版本号> version 2>/dev/null && echo "版本已存在!" || echo "版本可发布"

# 发布到 npm（使用 changeset publish，不是 pnpm -r publish）
# changeset publish 会自动按依赖顺序发布：先 api，再 cli
npx changeset publish

# 推送
git push && git push --tags
```

#### 5.4 清理 beta tag

```bash
# 删除 npm 的 beta tag
npm dist-tag rm @lexmin0412/gcm beta
npm dist-tag rm @lexmin0412/gcm-api beta
```

### Step 6: VSCode 插件发布（如有变更）

vsc-ext 被 changeset ignore，需要单独处理，但版本号与 npm 包保持一致：

```bash
# 检查 vsc-ext 是否有变更
git log $(git describe --tags --abbrev=0)..HEAD --oneline packages/vsc-ext/

# 如果有变更，同步版本号到与 cli/api 一致
cd packages/vsc-ext
npm version <新版本号> --no-git-tag-version  # 如 1.10.0

# 打包（使用 esbuild bundle）
pnpm run package

# 发布到 VSCode Marketplace
pnpm run publish

# 提交版本变更
git add packages/vsc-ext/package.json
git commit -m "chore(vsc-ext): sync version to <新版本号>"
```

**注意**：
- VSCode Marketplace 不允许同一版本号重复上传，版本号必须递增
- 使用 `pnpm run package`（即 `vsce package --no-dependencies`）
- 使用 `pnpm run publish`（即 `vsce publish --no-dependencies`）

### Step 7: 汇总

报告：
- 各包的新版本号（npm 包 + vsc-ext 统一）
- npm 发布结果
- VSCode 插件发布结果（如有）
- GitHub Release 链接（如需，执行 `gh release create v<version> --notes-from-tag`）

## Beta 回退

如果 beta 验证失败：

```bash
# 1. 退出 beta 模式
npx changeset pre exit

# 2. 删除 beta tag
npm dist-tag rm @lexmin0412/gcm beta
npm dist-tag rm @lexmin0412/gcm-api beta

# 3. 重置版本号
git checkout -- packages/*/package.json package.json

# 4. 清理 changeset 文件
rm .changeset/pre.json

# 5. 重新提交
git add -A
git commit -m "chore: revert beta release"
```

## 故障排除

| 问题 | 解决方案 |
|------|----------|
| npm 未登录 | `npm login` |
| npm 2FA | `npx changeset publish --otp <code>` 或设置 Access Token |
| 版本已存在 | 检查是否重复发布，或手动升级版本号 |
| 构建失败 | 修复 TS 错误后重试 |
| tag 冲突 | `git tag -d <tag>` 删除旧 tag |
| 部分发布失败 | 不要 push，修复后重新 `changeset publish` |
| beta 验证失败 | 执行 [Beta 回退](#beta-回退) |
| vsce npm list 失败 | 使用 esbuild bundle + `--no-dependencies` |
| VSIX 版本已存在 | 递增版本号后重新打包 |
| workspace 依赖找不到 | vsc-ext 用固定 npm 版本号，不用 `workspace:*` |

## 发布前检查清单

- [ ] npm 登录状态正常（`npm whoami`）
- [ ] 所有包版本号一致（根目录 + api + cli + vsc-ext）
- [ ] 构建成功（`pnpm build`）
- [ ] Beta 版本验证通过
- [ ] VSCode 插件用 esbuild bundle 打包
- [ ] vsc-ext 的 `@lexmin0412/gcm-api` 用固定版本号

## 快捷命令

用户说 "发布" 时的快速判断：
1. 检查 npm 登录 → 未登录则停止
2. 检查本地 vs 远程版本 → 已 bump 则直接 publish
3. 没有 changeset → 分析 git log 帮创建
4. 走完整流程（含 beta）
