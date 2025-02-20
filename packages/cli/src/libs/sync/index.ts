import fs from "fs";
import { getAllUserConfigs, readConfigs } from "@lexmin0412/gcm-api";
import { REPO_FOLDER_PATH } from "./const";
import { cloneConfigRepo, pushConfig, writeConfigIntoLocalRepo } from "./steps";
import { isEqual } from "./utils";
import { createServerAndOpenPage } from "./server";
import path from "path";

// 获取本地用户配置
const localUserConfigs = getAllUserConfigs();

/**
 * 同步配置主函数
 */
export const sync = async () => {
	// clone 用户配置仓库
	await cloneConfigRepo();
	// 判断本地配置是否与远程配置一致
	const { sync } = readConfigs()
	const GCM_CONFIG_FILE_PATH = path.join(REPO_FOLDER_PATH, sync.dir, sync.filename);
	const remoteUserConfigs = JSON.parse(fs.readFileSync(GCM_CONFIG_FILE_PATH, "utf8"));
	if (!remoteUserConfigs?.length) {
		// 远程配置不存在，直接写入本地配置
		writeConfigIntoLocalRepo(localUserConfigs);
		await pushConfig();
	} else if (isEqual(localUserConfigs, remoteUserConfigs)) {
		console.log("本地配置与远程配置一致，无需同步");
	} else {
		console.log("本地配置与远程配置存在冲突，即将打开浏览器，请前往处理");
		// 打开冲突处理页面
		const mergedConfig = await createServerAndOpenPage({
			localConfig: localUserConfigs,
			remoteConfig: remoteUserConfigs,
		})
		// 写入本地配置
		writeConfigIntoLocalRepo(mergedConfig);
		// 推送配置
		await pushConfig();
	}
	process.exit(0);
}


