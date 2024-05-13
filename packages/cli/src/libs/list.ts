import pc from 'picocolors'
import { getAllUserConfigs, createEmptyJsonWhenNeeds, getCurrentConfig } from '@lexmin0412/gcm-api'
import { UserConfig } from './../types'

export const list = () => {
	createEmptyJsonWhenNeeds()
	const configs = getAllUserConfigs()
	const currentConfig = getCurrentConfig()
	console.log(`共 ${configs.length} 个配置`)
	configs.forEach((config: UserConfig) => {
		const configStr = `
alias: ${config.alias}
name: ${config.name}
email: ${config.email}
		`
		if (config.name === currentConfig.name && config.email === currentConfig.email) {
			console.log(pc.green(configStr));
		} else {
			console.log(configStr)
		}
	});
	console.log(pc.yellow('可通过 `gcm add` 添加配置，通过 `gcm use <alias>` 快速切换配置'))
}
