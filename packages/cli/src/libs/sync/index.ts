import fs from "fs";
import path from "path";
import { readConfigs, configJsonPath } from "@lexmin0412/gcm-api";
import { REPO_FOLDER_PATH } from "./const";
import { cloneConfigRepo, getConfigFilePath, pushConfig } from "./steps";

interface SyncOptions {
	json?: boolean
}

/**
 * 同步配置：从远程拉取覆盖本地
 */
export const syncPull = async (options: SyncOptions = {}) => {
	try {
		// clone 远程配置仓库
		await cloneConfigRepo(options);

		// 获取远程配置文件路径
		const remoteConfigPath = getConfigFilePath();
		if (!fs.existsSync(remoteConfigPath)) {
			const msg = "远程配置文件不存在";
			if (options.json) {
				console.log(JSON.stringify({ success: false, error: msg }));
			} else {
				console.error(msg);
			}
			process.exit(1);
		}

		// 读取远程配置
		const remoteConfig = JSON.parse(fs.readFileSync(remoteConfigPath, "utf8"));

		// 覆盖本地配置
		fs.writeFileSync(configJsonPath, JSON.stringify(remoteConfig, null, 2));

		const msg = "配置已从远程拉取并覆盖本地";
		if (options.json) {
			console.log(JSON.stringify({ success: true, message: msg }));
		} else {
			console.log(msg);
		}
	} catch (error: any) {
		const msg = error.message || "同步失败";
		if (options.json) {
			console.log(JSON.stringify({ success: false, error: msg }));
		} else {
			console.error(msg);
		}
		process.exit(1);
	}
};

/**
 * 同步配置：从本地推送到远程
 */
export const syncPush = async (options: SyncOptions = {}) => {
	try {
		// clone 远程配置仓库
		await cloneConfigRepo(options);

		// 读取本地配置
		const localConfig = readConfigs();

		// 获取远程配置文件路径
		const remoteConfigPath = getConfigFilePath();

		// 用本地配置覆盖远程
		fs.writeFileSync(remoteConfigPath, JSON.stringify(localConfig, null, 2));

		// 推送到远程
		await pushConfig(options);

		const msg = "配置已推送到远程";
		if (options.json) {
			console.log(JSON.stringify({ success: true, message: msg }));
		} else {
			console.log(msg);
		}
	} catch (error: any) {
		const msg = error.message || "同步失败";
		if (options.json) {
			console.log(JSON.stringify({ success: false, error: msg }));
		} else {
			console.error(msg);
		}
		process.exit(1);
	}
};
