import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import { execSync } from 'child_process'
import { UserConfig } from './../types'

export * from './fs'

const USER_HOME = os.homedir()

export const rootPath = path.resolve(USER_HOME, '.gcm')

if ( !fs.existsSync(rootPath) ) {
	fs.mkdirSync(rootPath)
}

export const configJsonPath = path.resolve(rootPath, 'config.json')

export const createEmptyJsonWhenNeeds = () => {
	if (!fs.existsSync(configJsonPath)) {
		const users: UserConfig[] = []
		fs.writeFileSync(configJsonPath, JSON.stringify({users}, null, 2))
	}
}

export const getCurrentConfig = () => {
	const currentUserName = execSync('git config --get user.name').toString().trim()
	const currentUserEmail = execSync('git config --get user.email').toString().trim()
	return {
		name: currentUserName,
		email: currentUserEmail
	}
}

export const addConfig = (config: UserConfig) => {
	createEmptyJsonWhenNeeds()
	const configJson = require(configJsonPath)
	configJson.users.push(config)
	fs.writeFileSync(configJsonPath, JSON.stringify(configJson, null, 2))
}

export const removeConfig = (alias: string) => {
	if (!isConfigJsonExists()) {
		console.error('配置文件不存在')
		process.exit(1)
	}
	const configJson = require(configJsonPath)
	const targetUserConfigIndex = configJson.users.findIndex(((config: UserConfig)=>config.alias === alias))
	if (targetUserConfigIndex === -1 ) {
		console.error(`不存在别名为 ${alias} 的配置`)
		process.exit(1)
	}
	configJson.users.splice(targetUserConfigIndex, 1)
	fs.writeFileSync(configJsonPath, JSON.stringify(configJson, null, 2))
	console.log(`配置 ${alias} 删除成功`)
}

export const isConfigJsonExists = () => {
	const isExists = fs.existsSync(configJsonPath)
	return isExists
}

export const readConfigs = () => {
	createEmptyJsonWhenNeeds()
	const configs = JSON.parse(fs.readFileSync(configJsonPath, 'utf8'))
	return configs
}

export const getAllUserConfigs = () => {
	const configs = readConfigs()
	return configs.users
}

export const getConfigByAlias = (alias: string) => {
	const configs = readConfigs()
	const config = configs.users.find((config: UserConfig) => config.alias === alias)
	return config || null
}

export const getProjectConfig = (projectPath: string = process.cwd()) => {
	const currentUserName = execSync('git config --get user.name', {
		cwd: projectPath
	}).toString().trim()
	const currentUserEmail = execSync('git config --get user.email', {
		cwd: projectPath
	}).toString().trim()
	return {
		name: currentUserName,
		email: currentUserEmail
	}
}
