import * as vscode from 'vscode';
import { execSync } from 'child_process';
import { getAllUserConfigs, setProjectConfig } from '@lexmin0412/gcm-api'

let myStatusBarItem: vscode.StatusBarItem;
const EVENTS = {
	use: 'gcm-vscode.use',
	open: 'gcm-vscode.open',
};

// 初始化状态栏
const initStatusBar = async (context: vscode.ExtensionContext) => {
	const { subscriptions } = context;
	const currentEditorPath = vscode.window.activeTextEditor?.document.uri.path
	const workDir = currentEditorPath?.slice(0, currentEditorPath.lastIndexOf('/'))
	const userName = await execSync('git config user.name', {
		cwd: workDir
	}).toString().trim();
	const userEmail = await execSync('git config user.email', {
		cwd: workDir
	}).toString().trim();
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 300);
	myStatusBarItem.command = EVENTS.use;  // 点击时执行命令
	myStatusBarItem.text = `${userName}, ${userEmail}`;
	subscriptions.push(myStatusBarItem);
	myStatusBarItem.show();
};

// 注册事件
const registerCommand = (context: vscode.ExtensionContext) => {
	let disposable = vscode.commands.registerCommand(EVENTS.use, async () => {

		// 打开一个选择框，让用户选择
		const userConfig = getAllUserConfigs()
		const selectOptions = userConfig.map((item) => ({
			label: item.alias,
			description: `${item.name}, ${item.email}`,
		}));
		const selected = await vscode.window.showQuickPick(selectOptions, {
			placeHolder: '请选择你的配置',
		})

		// 用户取消选择
		if (!selected) {
			return;
		}

		const selectedItem = userConfig.find(item=>item.alias === selected.label)

		const currentEditorPath = vscode.window.activeTextEditor?.document.uri.path
		const workDir = currentEditorPath?.slice(0, currentEditorPath.lastIndexOf('/'))

		if (!workDir) {
			vscode.window.showErrorMessage('无法确定工作目录。请在目标 Git 仓库中打开一个文件再重试。');
			return;
		}

		if (selectedItem) {
			const success = setProjectConfig(selectedItem, workDir)
			if (success) {
				// 更新已经存在的状态栏文字
				myStatusBarItem.text = `${selectedItem.name}, ${selectedItem.email}`
				vscode.window.showInformationMessage(`Git 配置已切换为: ${selectedItem.alias}`);
			} else {
				vscode.window.showErrorMessage('设置 Git 配置失败。请确保当前文件位于一个有效的 Git 仓库中。');
			}
		}

	});
	context.subscriptions.push(disposable);
};

const registerOpenFileCommand = (context: vscode.ExtensionContext) => {
	let disposable = vscode.commands.registerCommand(EVENTS.open, async() => {

		// 获取当前聚焦的文件路径
		const currentEditorPath = vscode.window.activeTextEditor?.document.uri.path
		console.log('currentEditorPath', currentEditorPath)

		// 获取仓库 base
		const repoDomain = await execSync('git remote get-url origin', {}).toString().trim()
		console.log('repoDomain', repoDomain)

		// 打开一个外部链接
		vscode.env.openExternal(vscode.Uri.parse(`https://github.com/lexmin0412`))
	})
	context.subscriptions.push(disposable);
}

// 扩展激活
export async function activate(context: vscode.ExtensionContext) {
	registerCommand(context);
	registerOpenFileCommand(context);
	await initStatusBar(context);
}

// 扩展销毁
export function deactivate() {}
