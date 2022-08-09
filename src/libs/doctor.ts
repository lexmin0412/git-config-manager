import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { getAllUserConfigs, getCurrentConfig } from './../utils'
import { UserConfig } from '../types'


export const doctor = () => {
	const pkgJsonPath = path.resolve(process.cwd(), 'package.json')

	if ( !fs.existsSync(pkgJsonPath) ) {
		console.error(`package.json 不存在，请在项目根目录执行 gcm doctor`)
		process.exit(1)
	}

	const currentRemoteOrigin = execSync('git remote -v').toString().trim()
	if ( !currentRemoteOrigin ) {
		console.log('当前项目配置远程仓库，请确认是否位于项目根目录')
	}

	const currentRemote = currentRemoteOrigin.split('\n')[0]
	const allConfigs = getAllUserConfigs()
	const currentConfig = getCurrentConfig()
	const curMatchedItem: UserConfig = allConfigs.find((config: UserConfig) => currentRemote.includes(config.origin))
	if ( curMatchedItem ) {
		if ( currentConfig.name === curMatchedItem.name && currentConfig.email === curMatchedItem.email ) {
			console.log(`当前配置 ${curMatchedItem.alias} 正确
user.name: ${currentConfig.name}
user.email: ${currentConfig.email}
supported origin: ${curMatchedItem.origin}
remote: ${currentRemote}`)
		} else {
			console.log(`当前配置 ${curMatchedItem.alias} 错误，请检查：
user.name 应为 ${curMatchedItem.name}，实际为 ${currentConfig.name}
user.email 应为 ${curMatchedItem.email}，实际为 ${currentConfig.email}`)
		}
	} else {
		console.log(`远程地址 ${currentRemote} 不存在于用户配置列表中，请使用 \`gcm list\` 查看所有配置，使用 \`gcm add\` 添加`)
	}
}
