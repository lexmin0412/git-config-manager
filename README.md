# GCM

git 用户配置管理工具。

![version](https://img.shields.io/npm/v/@lexmin0412/gcm) ![workflow](https://img.shields.io/github/workflow/status/lexmin0412/gcm/publish%20node%20package?label=workflow) ![licence](https://img.shields.io/npm/l/@lexmin0412/gcm) ![downloads-month](https://img.shields.io/npm/dm/@lexmin0412/gcm)

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


## 更新日志

[点我](https://github.com/lexmin0412/gcm/releases) 前往。
