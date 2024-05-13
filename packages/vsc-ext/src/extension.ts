import * as vscode from 'vscode';
import { execSync } from 'child_process';
import { getAllUserConfigs } from '@lexmin0412/gcm-api'

let myStatusBarItem: vscode.StatusBarItem;
const EVENTS = {
	use: 'gcm-vscode.use'
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
		const selectOptions = userConfig.map((item=>item.alias))
		const selected = await vscode.window.showQuickPick(selectOptions, {
			placeHolder: '请选择你的配置',
		})
		const selectedItem = userConfig.find(item=>item.alias === selected)
		// 更新已经存在的状态栏文字
		myStatusBarItem.text = `${selectedItem?.name}, ${selectedItem?.email}`

		vscode.window.showInformationMessage('gcm use 执行成功!');
	});
	context.subscriptions.push(disposable);
};

// 扩展激活
export async function activate(context: vscode.ExtensionContext) {
	registerCommand(context);
	await initStatusBar(context);
}

// 扩展销毁
export function deactivate() {}
