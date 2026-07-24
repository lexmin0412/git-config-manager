import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { readConfigs } from "@lexmin0412/gcm-api";
import { CONFIG_REPO_NAME, REPO_FOLDER_PATH, TEMP_SYNC_DIR } from "./const";

interface SyncOptions {
	json?: boolean
}

/**
 * 获取远程配置文件路径
 */
export const getConfigFilePath = (): string => {
	const { sync } = readConfigs();
	if (!sync) {
		throw new Error("未找到同步配置，请先执行 gcm set-config sync");
	}
	return path.join(REPO_FOLDER_PATH, sync.dir, sync.filename);
};

/**
 * clone 远程配置仓库到本地
 */
export const cloneConfigRepo = async (options: SyncOptions = {}) => {
	if (!options.json) {
		console.log("正在下载远程配置...");
	}

	// 如果已存在，则递归清除目录
	if (fs.existsSync(TEMP_SYNC_DIR)) {
		fs.rmSync(TEMP_SYNC_DIR, { recursive: true });
	}
	// 创建临时工作目录
	fs.mkdirSync(TEMP_SYNC_DIR, { recursive: true });

	// 获取用户配置仓库地址
	const { sync } = readConfigs();
	if (!sync?.repoUrl) {
		throw new Error("未找到同步配置，请先执行 gcm set-config sync");
	}

	// clone 仓库
	execSync(`git clone ${sync.repoUrl} ${CONFIG_REPO_NAME}`, {
		cwd: TEMP_SYNC_DIR,
		stdio: "ignore",
	});

	if (!options.json) {
		console.log("远程配置下载完成");
	}
};

/**
 * 推送配置到远程
 */
export const pushConfig = async (options: SyncOptions = {}) => {
	if (!options.json) {
		console.log("正在推送到远程...");
	}

	// git add + commit + push
	execSync("git add .", { cwd: REPO_FOLDER_PATH });
	execSync('git commit -m "sync: update config"', { cwd: REPO_FOLDER_PATH });
	execSync("git push", { cwd: REPO_FOLDER_PATH });

	if (!options.json) {
		console.log("推送完成");
	}
};
