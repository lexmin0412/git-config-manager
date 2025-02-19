import fs from 'fs'
import inquirer from "inquirer";
import { CONFIG_FOLDER_PATH, GCM_CONFIG_FILE_PATH, REPO_FOLDER_PATH, TEMP_SYNC_DIR } from "./const";
import { execSync, type ExecSyncOptionsWithBufferEncoding } from "child_process";
import { UserConfig } from '../../types';

/**
 * 执行命令行脚本的统一选项
 */
const EXEC_OPTIONS: ExecSyncOptionsWithBufferEncoding = {
	cwd: REPO_FOLDER_PATH,
}

/**
 * clone 远程配置仓库到本地
 */
export const cloneConfigRepo = async () => {
	console.log("开始下载远程配置");

	// 如果已存在，则递归清除目录
	if (fs.existsSync(TEMP_SYNC_DIR)) {
		fs.rmSync(TEMP_SYNC_DIR, { recursive: true });
	}
	// 创建临时工作目录
	fs.mkdirSync(TEMP_SYNC_DIR);

	// 获取用户配置仓库
	const { configRepoUrl } = await inquirer.prompt([
		{
			type: "input",
			name: "configRepoUrl",
			message: "请输入配置仓库地址（建议使用 SSH 地址）",
		}
	])
	execSync(`git clone ${configRepoUrl}`, {
		cwd: TEMP_SYNC_DIR,
	});
	console.log("下载远程配置成功");
};

/**
 * 将本地用户配置写入到临时仓库的配置文件中
 */
export const writeConfigIntoLocalRepo = async (config: UserConfig[]) => {
	console.log("开始写入配置到本地仓库");
	// 判断 configFolder 是否存在，否则新建目录
	if (!fs.existsSync(CONFIG_FOLDER_PATH)) {
		fs.mkdirSync(CONFIG_FOLDER_PATH);
	}
	// 判断 configPath 是否存在，否则新建文件
	if (!fs.existsSync(GCM_CONFIG_FILE_PATH)) {
		fs.writeFileSync(GCM_CONFIG_FILE_PATH, "{}");
	}
	fs.writeFileSync(GCM_CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
	console.log("写入配置到本地仓库成功");
};

/**
 * 推送配置到远程
 */
export const pushConfig = async () => {
	console.log("开始推送配置到远程");
	// 初始化正确的 git 配置
	const { name, email } = await inquirer.prompt([
		{
			type: "input",
			name: "name",
			message: "请输入你的 git 用户名",
		},
		{
			type: "input",
			name: "email",
			message: "请输入你的 git 邮箱",
		},
	]);
	execSync(`git config user.name ${name}`, EXEC_OPTIONS);
	execSync(`git config user.email ${email}`, EXEC_OPTIONS);
	execSync("git add .", EXEC_OPTIONS);
	execSync('git commit -m "update gcm config"', EXEC_OPTIONS);
	execSync("git push origin main", EXEC_OPTIONS);
	console.log("推送配置到远程成功");
};

