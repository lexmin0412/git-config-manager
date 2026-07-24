import * as vscode from 'vscode';
import { execSync } from 'child_process';
import { getAllUserConfigs, setProjectConfig, getCurrentConfig, parseGitRemote, getProjectRemoteUrl } from '@lexmin0412/gcm-api'

let myStatusBarItem: vscode.StatusBarItem;
const EVENTS = {
	use: 'gcm-vscode.use',
	open: 'gcm-vscode.open',
	list: 'gcm-vscode.list',
	current: 'gcm-vscode.current',
};

// 获取当前编辑器的 Git 用户信息
const getGitUserInfo = async (uri?: vscode.Uri) => {
	const currentPath = uri?.fsPath || vscode.window.activeTextEditor?.document.uri.fsPath;
	if (!currentPath) return { name: '', email: '' };

	const workDir = currentPath.slice(0, currentPath.lastIndexOf('/'));
	try {
		const userName = execSync('git config user.name', { cwd: workDir, stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
		const userEmail = execSync('git config user.email', { cwd: workDir, stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
		return { name: userName, email: userEmail };
	} catch {
		return { name: '', email: '' };
	}
};

// 更新状态栏
const updateStatusBar = async () => {
	const { name, email } = await getGitUserInfo();
	if (name || email) {
		myStatusBarItem.text = `$(git-branch) ${name}${email ? ` <${email}>` : ''}`;
		myStatusBarItem.show();
	} else {
		myStatusBarItem.hide();
	}
};

// 初始化状态栏
const initStatusBar = async (context: vscode.ExtensionContext) => {
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 300);
	myStatusBarItem.command = EVENTS.use;
	context.subscriptions.push(myStatusBarItem);
	await updateStatusBar();

	// 监听编辑器切换
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(async () => {
			await updateStatusBar();
		})
	);

	// 监听文件变化 (针对 .git/config)
	const watcher = vscode.workspace.createFileSystemWatcher('**/.git/config');
	context.subscriptions.push(watcher);

	const handleChange = async () => {
		await updateStatusBar();
	};

	watcher.onDidChange(handleChange);
	watcher.onDidCreate(handleChange);
	watcher.onDidDelete(handleChange);
};

// 获取当前工作目录
const getWorkDir = (): string | undefined => {
	const currentEditorPath = vscode.window.activeTextEditor?.document.uri.path;
	if (!currentEditorPath) return undefined;
	return currentEditorPath.slice(0, currentEditorPath.lastIndexOf('/'));
};

// 注册切换配置命令
const registerUseCommand = (context: vscode.ExtensionContext) => {
	let disposable = vscode.commands.registerCommand(EVENTS.use, async () => {
		const userConfig = getAllUserConfigs()
		const selectOptions = userConfig.map((item) => ({
			label: item.alias,
			description: `${item.name}, ${item.email}`,
		}));
		const selected = await vscode.window.showQuickPick(selectOptions, {
			placeHolder: '请选择你的配置',
		})

		if (!selected) return;

		const selectedItem = userConfig.find(item => item.alias === selected.label)
		const workDir = getWorkDir();

		if (!workDir) {
			vscode.window.showErrorMessage('无法确定工作目录。请在目标 Git 仓库中打开一个文件再重试。');
			return;
		}

		if (selectedItem) {
			const success = setProjectConfig(selectedItem, workDir)
			if (success) {
				await updateStatusBar();
				vscode.window.showInformationMessage(`Git 配置已切换为: ${selectedItem.alias}`);
			} else {
				vscode.window.showErrorMessage('设置 Git 配置失败。请确保当前文件位于一个有效的 Git 仓库中。');
			}
		}
	});
	context.subscriptions.push(disposable);
};

// 注册打开远程链接命令
const registerOpenCommand = (context: vscode.ExtensionContext) => {
	let disposable = vscode.commands.registerCommand(EVENTS.open, async () => {
		const workDir = getWorkDir();
		if (!workDir) {
			vscode.window.showErrorMessage('无法确定工作目录。请在目标 Git 仓库中打开一个文件再重试。');
			return;
		}

		try {
			const remoteUrl = getProjectRemoteUrl(workDir);
			const parsed = parseGitRemote(remoteUrl);
			
			if (!parsed) {
				vscode.window.showErrorMessage('无法解析远程仓库地址。请确保当前仓库已配置 origin。');
				return;
			}

			// 构建 HTTPS URL
			let httpsUrl = '';
			if (parsed.protocol === 'ssh') {
				// git@github.com:owner/repo.git -> https://github.com/owner/repo
				const pathname = parsed.pathname.replace(/\.git$/, '');
				httpsUrl = `https://${parsed.host}/${pathname}`;
			} else if (parsed.protocol === 'https') {
				httpsUrl = parsed.raw.replace(/\.git$/, '');
			} else {
				vscode.window.showErrorMessage(`不支持的远程协议: ${parsed.protocol}`);
				return;
			}

			vscode.env.openExternal(vscode.Uri.parse(httpsUrl));
		} catch (error) {
			vscode.window.showErrorMessage('获取远程仓库地址失败。');
		}
	});
	context.subscriptions.push(disposable);
};

// 注册列出所有配置命令
const registerListCommand = (context: vscode.ExtensionContext) => {
	let disposable = vscode.commands.registerCommand(EVENTS.list, async () => {
		const userConfig = getAllUserConfigs();
		const currentConfig = getCurrentConfig();
		
		const items = userConfig.map((item) => ({
			label: item.alias,
			description: `${item.name} <${item.email}>`,
			detail: currentConfig && item.name === currentConfig.name && item.email === currentConfig.email 
				? '$(check) 当前使用' 
				: undefined,
		}));

		await vscode.window.showQuickPick(items, {
			placeHolder: '所有 Git 配置',
		});
	});
	context.subscriptions.push(disposable);
};

// 注册查看当前配置命令
const registerCurrentCommand = (context: vscode.ExtensionContext) => {
	let disposable = vscode.commands.registerCommand(EVENTS.current, async () => {
		const workDir = getWorkDir();
		if (!workDir) {
			vscode.window.showErrorMessage('无法确定工作目录。');
			return;
		}

		const currentConfig = getCurrentConfig();
		if (!currentConfig) {
			vscode.window.showWarningMessage('未检测到 Git 配置（user.name/user.email）。');
			return;
		}

		const allConfigs = getAllUserConfigs();
		const matched = allConfigs.find(c => c.name === currentConfig.name && c.email === currentConfig.email);

		if (matched) {
			vscode.window.showInformationMessage(
				`当前配置: ${matched.alias}\nuser.name: ${currentConfig.name}\nuser.email: ${currentConfig.email}`
			);
		} else {
			vscode.window.showWarningMessage(
				`当前配置未在 GCM 列表中:\nuser.name: ${currentConfig.name}\nuser.email: ${currentConfig.email}`
			);
		}
	});
	context.subscriptions.push(disposable);
};

// 扩展激活
export async function activate(context: vscode.ExtensionContext) {
	registerUseCommand(context);
	registerOpenCommand(context);
	registerListCommand(context);
	registerCurrentCommand(context);
	await initStatusBar(context);
}

// 扩展销毁
export function deactivate() {}
