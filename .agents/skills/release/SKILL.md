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

**linked 配置说明**：`gcm` 和 `gcm-api` 是 linked 关系，任一有 changeset → 两者都会发版。通常只需要给实际改动的包写 changeset。

## 核心约束

1. **禁止自动提交**：每次 `git commit` / `git push` 前必须向用户展示内容并等待确认
2. **分步执行**：每步完成后报告结果，确认无误再进入下一步
3. **必须在 master 分支**：不在则停止，不询问
4. **npm 登录检查**：Step 0 必须验证，否则后续回退成本高

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
- npm 开启 2FA → 提示需要提供 `--otp <code>`

### Step 1: 状态检测

**先检测是否有"已 bump 未 publish"的状态**：

```bash
# 获取远程版本
npm view @lexmin0412/gcm version
npm view @lexmin0412/gcm-api version

# 获取本地版本
cat packages/cli/package.json | grep '"version"'
cat packages/api/package.json | grep '"version"'
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
```

**执行后展示变更摘要**：
```bash
git diff --stat
git diff "**/CHANGELOG.md"
```

等待用户确认。

> 注意：`config.json` 中 `"commit": false`，所以 version 之后改动是 unstaged 的，需要手动 commit。

### Step 4: 提交 & 发布

```bash
# 展示将要提交的内容
git add -A
git status

# 等待用户确认后
git commit -m "chore(release): publish"
git tag v<新版本号>   # 使用 gcm 的版本号，格式统一为 v 前缀

# dry-run 检查版本不存在
npm view @lexmin0412/gcm@<新版本号> version 2>/dev/null && echo "版本已存在!" || echo "版本可发布"

# 发布到 npm（使用 changeset publish，不是 pnpm -r publish）
npx changeset publish

# 推送
git push && git push --tags
```

**发布失败处理**：
- publish 失败 → **不要** `git push`，修复后重新 `npx changeset publish`（会跳过已成功的包）
- 如果已 push 但部分失败 → 记录哪些包成功，修复后只重发失败的包
- npm 发布不可撤销（超过 72 小时），publish 前务必确认版本号

### Step 5: VSCode 插件发布（如有变更）

vsc-ext 被 changeset ignore，需要单独处理：

```bash
# 检查 vsc-ext 是否有变更
git log $(git describe --tags --abbrev=0)..HEAD --oneline packages/vsc-ext/

# 如果有变更，手动升级版本
cd packages/vsc-ext
npm version patch  # 或 minor/major

# 发布到 VSCode Marketplace（需要 PAT）
pnpm --filter gcm-vscode vsce:publish

# 提交版本变更
git add packages/vsc-ext/package.json
git commit -m "chore(vsc-ext): bump version"
```

### Step 6: 汇总

报告：
- 各包的新版本号
- npm 发布结果
- VSCode 插件发布结果（如有）
- GitHub Release 链接（如需，执行 `gh release create v<version> --notes-from-tag`）

## 故障排除

| 问题 | 解决方案 |
|------|----------|
| npm 未登录 | `npm login` |
| npm 2FA | `npx changeset publish --otp <code>` |
| 版本已存在 | 检查是否重复发布，或手动升级版本号 |
| 构建失败 | 修复 TS 错误后重试 |
| tag 冲突 | `git tag -d <tag>` 删除旧 tag |
| 部分发布失败 | 不要 push，修复后重新 `changeset publish` |

## 快捷命令

用户说 "发布" 时的快速判断：
1. 检查 npm 登录 → 未登录则停止
2. 检查本地 vs 远程版本 → 已 bump 则直接 publish
3. 没有 changeset → 分析 git log 帮创建
4. 走完整流程
