import { execSync } from 'child_process'
import { getAllUserConfigs, getCurrentConfig, UserConfig } from '@lexmin0412/gcm-api'
import pc from 'picocolors'

interface DoctorOptions {
	json?: boolean
}

interface DoctorResult {
	success: boolean
	currentConfig: { name: string; email: string } | null
	remote: string | null
	matchedAlias: string | null
	issues: string[]
}

export const doctor = (options: DoctorOptions = {}) => {
	const result: DoctorResult = {
		success: true,
		currentConfig: null,
		remote: null,
		matchedAlias: null,
		issues: []
	}

	let currentRemoteOrigin = ''
	try {
		currentRemoteOrigin = execSync('git remote -v', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim()
	} catch {
		// 忽略错误
	}

	if (!currentRemoteOrigin) {
		result.issues.push('未检测到配置远程仓库，请确认是否位于项目根目录')
		if (options.json) {
			result.success = false
			console.log(JSON.stringify(result, null, 2))
		} else {
			console.log('未检测到配置远程仓库，请确认是否位于项目根目录')
		}
		return
	}

	const currentRemote = currentRemoteOrigin.split('\n')[0]
	result.remote = currentRemote

	const allConfigs = getAllUserConfigs()
	const currentConfig = getCurrentConfig()
	
	if (!currentConfig) {
		result.issues.push('未检测到当前 git 用户配置，请先设置 user.name 和 user.email')
		if (options.json) {
			result.success = false
			console.log(JSON.stringify(result, null, 2))
		} else {
			console.log('未检测到当前 git 用户配置，请先设置 user.name 和 user.email')
		}
		return
	}

	result.currentConfig = currentConfig

	const curMatchedItem: UserConfig | undefined = allConfigs.find((config: UserConfig) => currentRemote.includes(config.origin))
	
	if (curMatchedItem) {
		result.matchedAlias = curMatchedItem.alias
		if (currentConfig.name === curMatchedItem.name && currentConfig.email === curMatchedItem.email) {
			if (options.json) {
				console.log(JSON.stringify(result, null, 2))
			} else {
				console.log(`当前配置 ${curMatchedItem.alias} 正确
user.name: ${currentConfig.name}
user.email: ${currentConfig.email}
supported origin: ${curMatchedItem.origin}
remote: ${currentRemote}`)
			}
		} else {
			result.success = false
			result.issues.push(`当前配置 ${curMatchedItem.alias} 错误`)
			if (options.json) {
				result.issues.push(`user.name 应为 ${curMatchedItem.name}，实际为 ${currentConfig.name}`)
				result.issues.push(`user.email 应为 ${curMatchedItem.email}，实际为 ${currentConfig.email}`)
				console.log(JSON.stringify(result, null, 2))
			} else {
				console.log(`当前配置 ${curMatchedItem.alias} 错误，请检查：
user.name 应为 ${curMatchedItem.name}，实际为 ${currentConfig.name}
user.email 应为 ${curMatchedItem.email}，实际为 ${currentConfig.email}`)
			}
		}
	} else {
		result.success = false
		result.issues.push(`远程地址 ${currentRemote} 不存在于用户配置列表中`)
		if (options.json) {
			console.log(JSON.stringify(result, null, 2))
		} else {
			console.log(`远程地址 ${currentRemote} 不存在于用户配置列表中，请使用 \`gcm list\` 查看所有配置，使用 \`gcm add\` 添加`)
		}
	}
}
