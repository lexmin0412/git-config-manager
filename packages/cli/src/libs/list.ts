import pc from 'picocolors'
import { getAllUserConfigs, createEmptyJsonWhenNeeds, getCurrentConfig, UserConfig } from '@lexmin0412/gcm-api'

interface ListOptions {
	json?: boolean
}

export const list = (options: ListOptions = {}) => {
	createEmptyJsonWhenNeeds()
	const configs = getAllUserConfigs()
	const currentConfig = getCurrentConfig()

	if (options.json) {
		const result = configs.map((config: UserConfig) => ({
			...config,
			current: currentConfig 
				? config.name === currentConfig.name && config.email === currentConfig.email 
				: false
		}))
		console.log(JSON.stringify(result, null, 2))
		return
	}

	console.log(`共 ${configs.length} 个配置`)
	configs.forEach((config: UserConfig) => {
		const configStr = `
alias: ${config.alias}
name: ${config.name}
email: ${config.email}
		`
		if (currentConfig && config.name === currentConfig.name && config.email === currentConfig.email) {
			console.log(pc.green(configStr));
		} else {
			console.log(configStr)
		}
	});
	console.log(pc.yellow('可通过 `gcm add` 添加配置，通过 `gcm use <alias>` 快速切换配置'))
}
