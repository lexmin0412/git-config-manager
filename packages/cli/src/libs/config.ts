import fs from 'fs'
import inquirer from "inquirer"
import { configJsonPath, readConfigs } from "@lexmin0412/gcm-api"
import pc from 'picocolors'

export const getConfig = async (type: 'sync') => {
	if (type !== 'sync') {
		console.error('不支持的配置类型, 请检查你的命令是否正确')
		process.exit(1)
	}
	const configContent = readConfigs()
	if (!configContent.sync) {
		console.log(pc.red('未找到同步配置'))
		process.exit(1)
	}
	console.log(pc.green('同步配置如下:'))
	console.table([{
		type: configContent.sync.type,
		repoUrl: configContent.sync.repoUrl,
		dir: configContent.sync.dir,
		filename: configContent.sync.filename
	}])
	process.exit(0)

}

export const setConfig = async (type: 'sync') => {
	// 获取命令中携带的标识参数
	if (type !== 'sync') {
		console.error('不支持的配置类型, 请检查你的命令是否正确')
		process.exit(1)
	}
	const {
		storageType,
		repoUrl,
		dir,
		filename
	} = await inquirer.prompt([
		{
			type: 'list',
			choices: [
				{
					name: 'Github 仓库',
					value: 'github'
				}
			],
			name: 'storageType',
			message: '请选择存储类型'
		},
		{
			type: 'input',
			name: 'repoUrl',
			message: '请输入仓库地址（支持 https 和 ssh）'
		},
		{
			type: 'input',
			name: 'dir',
			message: '请输入子目录',
			default: 'gcm'
		},
		{
			type: 'input',
			name: 'filename',
			message: '请输入文件名称',
			default: 'config.json'
		},
	])
	const configContent = readConfigs()
	configContent.sync = {
		type: storageType,
		repoUrl,
		dir,
		filename
	}
	fs.writeFileSync(configJsonPath, JSON.stringify(configContent, null, 2))
	console.log(pc.green('同步配置写入成功:'))
	const newConfigContent = readConfigs()
	console.table([{
		type: newConfigContent.sync.type,
		repoUrl: newConfigContent.sync.repoUrl,
		dir: newConfigContent.sync.dir,
		filename: newConfigContent.sync.filename
	}])

}
