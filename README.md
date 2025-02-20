# GCM

git 用户配置管理工具。

![version](https://img.shields.io/npm/v/@lexmin0412/gcm) ![NPM Last Update](https://img.shields.io/npm/last-update/@lexmin0412/gcm) ![NPM Downloads](https://img.shields.io/npm/dm/@lexmin0412/gcm) ![GitHub commit activity](https://img.shields.io/github/commit-activity/y/lexmin0412/git-config-manager)

![Repo Beats](https://repobeats.axiom.co/api/embed/7b1fdf8c60db6bc080c1086aeb519fbc19531717.svg "Repobeats analytics image")

## 目录

- [简介](#简介)
- [安装](#安装)
- [功能](#功能)

## 简介

GCM, 全称 Git Config Manager，用于在不同工作区(目录) 灵活切换不同的 Git 配置，降低心智负担。

开发这个工具的初衷，是因为我的设备既用于公司项目开发，平时也会写一些自己的项目，我需要频繁不断地在不同 Git 账号之间切换以确保我使用正确的用户来进行提交，一次次的 `git config user.name xxx`，`git config user.name xxx@xxx.com` 耗费了我大量的时间，每次手动输入也难免会产生差错，造成一些未知用户的提交。于是我下定决心要开发这个工具，它可以帮你实现如下需求：

- 全局维护多个 Git 用户配置，在需要时可以方便地切换
- 快速查询当前目录应用的 Git 用户配置
- 扫描某个目录下存在多少份不同的 Git 用户配置，然后快速纠正它

查看 [功能](#功能) 部分来了解它所有的 API，如果你有什么意见或建议，也欢迎通过 [issue](https://github.com/lexmin0412/gcm/issues) 来进行交流。

## 安装

```shell
npm install @lexmin0412/gcm -g
```

## 功能

**说明：**
> 如果本机已有 gcm 命令，可以使用 `gitconf` 命令来替换，如 `gcm list` 可以改为 `gitconf list`，其他命令同理。

### `gcm list`

简写：`gcm ls`。

查看所有用户配置。

### `gcm add`

添加用户配置，需要输入别名、用户、邮箱信息。

### `gcm use <alias>`

通过别名切换用户配置。

### `gcm remove`

简写：`gcm rm`。

通过别名删除用户配置。

### `gcm current`

> 注：v1.1.0 以上版本支持。

简写：`gcm cur`。

显示当前用户正在使用的配置。

### `gcm scan`

> 注：v1.2.0 以上版本支持。

简写：`gcm sc`。

扫描指定目录（默认当前用户目录）下的所有用户配置。

### `gcm doctor`

> 注：v1.3.0 以上版本支持。

诊断当前目录下使用的 git 配置是否正确。

### `gcm upgrade`

> 注：v1.4.0 以上版本支持。

更新全局 `gcm` 到 latest 版本。

### `gcm sync`

> 注：v1.8.0 以上版本支持。

同步 GCM 配置到远程仓库。

### `gcm get-config`

> 注：v1.8.0 以上版本支持。

获取 GCM 的同步配置。

### `gcm set-config`

> 注：v1.8.0 以上版本支持。

修改 GCM 的同步配置。


## 更新日志

[点我](https://github.com/lexmin0412/gcm/releases) 前往。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=lexmin0412/git-config-manager&type=Date)](https://star-history.com/#lexmin0412/git-config-manager&Date)
