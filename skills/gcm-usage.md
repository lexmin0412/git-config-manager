---
name: gcm-usage
description: GCM (Git Config Manager) 使用指南。当用户需要管理 Git 用户配置、切换 Git 账号、查看当前 Git 配置时使用此技能。
---

# GCM 使用指南

GCM 是一个 Git 用户配置管理工具，用于在不同工作区灵活切换不同的 Git 配置。

## 安装

```bash
npm install -g @lexmin0412/gcm
```

## 命令列表

### 查看所有配置

```bash
# 人类可读格式
gcm list
gcm ls  # 简写

# JSON 格式（AI 推荐）
gcm list --json
```

JSON 输出示例：
```json
[
  {
    "alias": "work",
    "name": "张三",
    "email": "z@work.com",
    "origin": "github.com",
    "current": true
  }
]
```

### 查看当前配置

```bash
# 人类可读格式
gcm current
gcm cur  # 简写

# JSON 格式（AI 推荐）
gcm current --json
```

JSON 输出示例：
```json
{
  "matched": true,
  "alias": "work",
  "name": "张三",
  "email": "z@work.com"
}
```

### 添加配置

```bash
# 交互式（人类使用）
gcm add

# 非交互式（AI 推荐）
gcm add --alias work --name "张三" --email "z@work.com" --origin github.com

# JSON 输出
gcm add --alias work --name "张三" --email "z@work.com" --origin github.com --json
```

### 切换配置

```bash
gcm use <alias>

# JSON 输出
gcm use work --json
```

### 删除配置

```bash
# 交互式（人类使用）
gcm remove
gcm rm  # 简写

# 非交互式（AI 推荐）
gcm remove --alias work

# JSON 输出
gcm remove --alias work --json
```

### 诊断当前配置

```bash
# 人类可读格式
gcm doctor

# JSON 格式（AI 推荐）
gcm doctor --json
```

JSON 输出示例：
```json
{
  "success": true,
  "currentConfig": { "name": "张三", "email": "z@work.com" },
  "remote": "git@github-work:owner/repo.git",
  "matchedAlias": "work",
  "issues": []
}
```

### 扫描目录下的 Git 配置

```bash
# 交互式（人类使用）
gcm scan
gcm sc  # 简写

# 非交互式（AI 推荐）
gcm scan --dir ~/projects

# JSON 输出
gcm scan --dir ~/projects --json
```

### 升级版本

```bash
# 交互式（人类使用）
gcm upgrade

# JSON 输出（自动升级，不询问）
gcm upgrade --json
```

### 查看版本

```bash
gcm --version

# JSON 输出
gcm --version --json
```

## AI 使用建议

1. **优先使用 `--json` 参数**：获取结构化输出，便于解析
2. **使用非交互参数**：`add` 和 `remove` 命令支持直接传参，避免交互式输入
3. **检查 `success` 字段**：JSON 输出中 `success: true` 表示成功，`success: false` 表示失败
4. **错误处理**：失败时会返回 `{ "success": false, "error": "错误信息" }`

## 常见场景

### 场景 1：查看当前使用的 Git 配置

```bash
gcm current --json
```

### 场景 2：添加一个新的 Git 配置

```bash
gcm add --alias personal --name "张三" --email "zhangsan@gmail.com" --origin github.com --json
```

### 场景 3：切换到指定配置

```bash
gcm use personal --json
```

### 场景 4：诊断当前仓库的配置是否正确

```bash
gcm doctor --json
```

### 场景 5：扫描某个目录下所有 Git 项目的配置

```bash
gcm scan --dir ~/projects --json
```

## 配置文件位置

GCM 配置文件存储在 `~/.gcm/config.json`，格式如下：

```json
{
  "users": [
    {
      "alias": "work",
      "name": "张三",
      "email": "z@work.com",
      "origin": "github.com"
    }
  ]
}
```
