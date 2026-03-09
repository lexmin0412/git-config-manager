import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import { execSync } from 'child_process'
import { ISyncConfig, UserConfig } from './types'
export { UserConfig } from './types'
import pc from 'picocolors'

const USER_HOME = os.homedir()

export const rootPath = path.resolve(USER_HOME, '.gcm')

if ( !fs.existsSync(rootPath) ) {
	fs.mkdirSync(rootPath)
}

export const configJsonPath = path.resolve(rootPath, 'config.json')

/**
 * 检查 Git 环境是否可用
 */
export const checkGitEnv = () => {
	try {
		execSync('git --version', { stdio: 'ignore' })
		return true
	} catch {
		console.error(pc.red('未检测到 Git 环境，请先安装 Git。'))
		return false
	}
}

/**
 * 检查当前目录是否为 Git 仓库
 */
export const isGitRepo = (projectPath: string = process.cwd()) => {
	try {
		execSync('git rev-parse --is-inside-work-tree', { cwd: projectPath, stdio: 'ignore' })
		return true
	} catch {
		return false
	}
}

export const createEmptyJsonWhenNeeds = () => {
	if (!fs.existsSync(configJsonPath)) {
		const users: UserConfig[] = []
		fs.writeFileSync(configJsonPath, JSON.stringify({users}, null, 2))
	}
}

export const getPkgJson = () => {
	return require(path.resolve(__dirname, '..', '..', 'package.json'))
}

export const getCurrentConfig = () => {
	if (!checkGitEnv()) return null;
	try {
		const currentUserName = execSync('git config --get user.name').toString().trim()
		const currentUserEmail = execSync('git config --get user.email').toString().trim()
		if (!currentUserName || !currentUserEmail) {
			return null
		}
		return {
			name: currentUserName,
			email: currentUserEmail
		}
	} catch {
		return null
	}
}

export const addConfig = (config: UserConfig) => {
	createEmptyJsonWhenNeeds()
	const configJson = require(configJsonPath)
	configJson.users.push(config)
	fs.writeFileSync(configJsonPath, JSON.stringify(configJson, null, 2))
	console.log(pc.green('添加成功✅'))
}

export const removeConfig = (alias: string) => {
	if (!isConfigJsonExists()) {
		console.error(pc.red('配置文件不存在'))
		process.exit(1)
	}
	const configJson = require(configJsonPath)
	const targetUserConfigIndex = configJson.users.findIndex(((config: UserConfig)=>config.alias === alias))
	if (targetUserConfigIndex === -1 ) {
		console.error(pc.red(`不存在别名为 ${alias} 的配置`))
		process.exit(1)
	}
	configJson.users.splice(targetUserConfigIndex, 1)
	fs.writeFileSync(configJsonPath, JSON.stringify(configJson, null, 2))
	console.log(pc.green(`配置 ${alias} 删除成功`))
}

export const isConfigJsonExists = () => {
	const isExists = fs.existsSync(configJsonPath)
	return isExists
}

export const readConfigs = (): {
	sync: ISyncConfig
	users: UserConfig[]
} => {
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
	if (!checkGitEnv() || !isGitRepo(projectPath)) {
		return { name: '', email: '' }
	}
	try {
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
	} catch {
		return { name: '', email: '' }
	}
}

export const setProjectConfig = (config: UserConfig, projectPath: string = process.cwd()) => {
	if (!checkGitEnv()) return false;
	if (!isGitRepo(projectPath)) {
		console.error(pc.red('当前目录不是一个有效的 Git 仓库。'));
		return false;
	}
	try {
		execSync(`git config user.name "${config.name}"`, { cwd: projectPath });
		execSync(`git config user.email "${config.email}"`, { cwd: projectPath });
		return true
	} catch (error) {
		console.error(pc.red('设置 git 配置失败，请检查权限或配置。'));
		return false
	}
}
