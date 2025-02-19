import http from "http";
import fs from "fs";
import os from "os";
import path from "path";
import { getAllUserConfigs } from "@lexmin0412/gcm-api";
import { execSync } from "child_process";
import inquirer from "inquirer";
import { UserConfig } from "../types";
import puppeteer from "puppeteer";

// 获取本地用户配置
const localUserConfigs = getAllUserConfigs();

const TEMP_FOLDER_NAME = "sync_temp_workspace";
// GCM 配置目录
const GCM_CONFIG_DIR = path.join(os.homedir(), ".gcm")
// 创建临时工作目录，准备同步配置
const tempDir = path.join(GCM_CONFIG_DIR, TEMP_FOLDER_NAME);
// 如果已存在，则递归清除目录
if (fs.existsSync(tempDir)) {
	fs.rmSync(tempDir, { recursive: true });
}
// 创建临时工作目录
fs.mkdirSync(tempDir);
// 下载远程用户配置
const cloneConfigRepo = async () => {
	console.log("开始下载远程配置");

	// 获取用户配置仓库
	const { configRepoUrl } = await inquirer.prompt([
		{
			type: "input",
			name: "configRepo",
			message: "请输入配置仓库地址（建议使用 SSH 地址）",
		}
	])
	execSync(`git clone ${configRepoUrl}`, {
		cwd: tempDir,
	});
	console.log("下载远程配置成功");
};

const GIT_REPO_NAME = "config";
const SUB_FOLDER = "gcm";
const GCM_CONFIG_FILE_NAME = "config.json";
const repoFolder = path.join(tempDir, GIT_REPO_NAME);
const configFolder = path.join(repoFolder, SUB_FOLDER);
const configPath = path.join(configFolder, GCM_CONFIG_FILE_NAME);

const writeConfig = async () => {
	console.log("开始写入本地配置");
	// 判断 configFolder 是否存在，否则新建目录
	if (!fs.existsSync(configFolder)) {
		fs.mkdirSync(configFolder);
	}
	// 判断 configPath 是否存在，否则新建文件
	if (!fs.existsSync(configPath)) {
		fs.writeFileSync(configPath, "{}");
	}
	fs.writeFileSync(configPath, JSON.stringify(localUserConfigs, null, 2));
	console.log("写入本地配置成功");
};

const pushConfig = async () => {
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
	execSync(`git config --global user.name ${name}`, {
		cwd: repoFolder,
	});
	execSync(`git config --global user.email ${email}`, {
		cwd: repoFolder,
	});
	execSync("git add .", {
		cwd: repoFolder,
	});
	execSync('git commit -m "update gcm config"', {
		cwd: repoFolder,
	});
	execSync("git push origin main", {
		cwd: repoFolder,
	});
	console.log("推送配置到远程成功");
};

cloneConfigRepo();

const createServerAndOpenPage = async () => {
	// 创建HTTP服务器
	const server = http.createServer((req, res) => {
		// 处理根路径请求
		const purePath = req.url?.slice(0, req.url.indexOf("?"));
		if (!purePath || purePath === "/") {
			const html = fs.readFileSync(
				path.join(__dirname, "../server/index.html")
			);
			res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
			return res.end(html);
		}

		// 处理其他静态文件
		const filePath = path.join(__dirname, req.url as string);
		if (fs.existsSync(filePath)) {
			const content = fs.readFileSync(filePath);
			res.end(content);
		} else {
			res.writeHead(404);
			res.end("Not found");
		}
	});

	const port = 56789;
	const baseURL = `http://localhost:${port}`;
	const url = `${baseURL}?ws=ws://localhost:${port}`;

	/**
	 * 打开冲突处理页面
	 */
	const openConflictWebPage = async () => {
		const browser = await puppeteer.launch({
			headless: false,
		});
		const page = await browser.newPage();
		await page.goto(url);
		// 监听页面中的点击事件
		await page.exposeFunction("onClickEvent", (event) => {
			console.log("点击事件发生:", event);
		});

		// 在页面中注入 JavaScript 代码来监听点击事件
		await page.evaluate(() => {
			document.addEventListener("click", (event) => {
				// 调用 Node.js 中暴露的函数
				window.onClickEvent({
					target: event.target.tagName,
					x: event.clientX,
					y: event.clientY,
				});
			});
		});

		// 监听页面中的输入事件
		await page.exposeFunction("onInputEvent", (event) => {
			console.log("输入事件发生:", event);
		});

		// 在页面中注入 JavaScript 代码来监听输入事件
		await page.evaluate(() => {
			document.addEventListener("input", (event) => {
				// 调用 Node.js 中暴露的函数
				window.onInputEvent({
					target: event.target.tagName,
					value: event.target.value,
				});
			});
		});

		// TODO 监听到点击提交按钮后，验证输入的内容是否正确，是则提交到远程

		// 处理完毕后关闭浏览器
		await new Promise((resolve) => setTimeout(resolve, 60000));
		await browser.close();
	};

	// 启动服务
	server.listen(port, async () => {
		console.log(`Server running at ${baseURL}`);
		// 获取本地配置内容
		openConflictWebPage();
	});
};

// 判断本地配置是否与远程配置一致
const remoteUserConfigs = JSON.parse(fs.readFileSync(configPath, "utf8"));
// 逐个元素对比
const isEqual = (
	localUserConfigs: UserConfig[],
	remoteUserConfigs: UserConfig[]
) => {
	let result = true;
	if (localUserConfigs.length !== remoteUserConfigs.length) {
		result = false;
		return result;
	}
	for (let i = 0; i < localUserConfigs.length; i++) {
		const localUserConfig = localUserConfigs[i];
		const remoteUserConfig = remoteUserConfigs[i];
		if (localUserConfig.alias !== remoteUserConfig.alias) {
			result = false;
		}
		if (localUserConfig.name !== remoteUserConfig.name) {
			result = false;
		}
		if (localUserConfig.email !== remoteUserConfig.email) {
			result = false;
		}
		if (localUserConfig.origin !== remoteUserConfig.origin) {
			result = false;
		}
	}
	return result;
};
if (!remoteUserConfigs?.length) {
	// 远程配置不存在，直接写入本地配置
	writeConfig();
	pushConfig();
} else if (isEqual(localUserConfigs, remoteUserConfigs)) {
	console.log("本地配置与远程配置一致，无需同步");
} else {
	console.log("本地配置与远程配置存在冲突，即将打开浏览器，请前往处理");
	// 打开冲突处理页面
	createServerAndOpenPage();
}
