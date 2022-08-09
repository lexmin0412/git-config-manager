import * as path from 'path'
import * as fs from 'fs'
import { addConfig, createEmptyJsonWhenNeeds, getProjectConfig } from './../utils/index'
import { runCmdSync } from '@lexmin0412/run'

const rootPath = path.resolve(__dirname, '..', '..')
const configJsonPath = path.resolve(rootPath, 'config.json')

export const readConfigs = () => {
	const configs = JSON.parse(fs.readFileSync(configJsonPath, 'utf8'))
	return configs
}

export const getConfigByAlias = (alias: string) => {
	const configs = readConfigs()
	const config = configs.users.find((config: UserConfig)=>config.alias === alias)
	return config || null
}

interface UserConfig {
	alias: string
	name: string
	email: string
}

export const use = (alias: string) => {

	createEmptyJsonWhenNeeds()

	if ( !fs.existsSync(configJsonPath) ) {
		const currentConfig = getProjectConfig()
		console.error(`配置文件不存在，当前 git 配置为:
user.name: ${currentConfig.name}
user.email: ${currentConfig.email}
此配置将被写为默认配置，别名为 default
执行 \`gcm ls\` 查看配置列表`)

		const defaultConfig = {
			alias: 'default',
			email: currentConfig.email,
			name: currentConfig.name,
			origin: 'github.com'
		}
		addConfig(defaultConfig)
		process.exit(1)
	} else {
		const config = getConfigByAlias(alias)
		if ( !config ) {
			console.error(`配置别名 ${alias} 不存在`)
			process.exit(1)
		} else {
			setConfig(config)
			const currentConfig = getProjectConfig()
			console.log(`当前 git 配置为:
user.name: ${currentConfig.name}
user.email: ${currentConfig.email}`)
		}
	}
}

export const setConfig = (config: UserConfig) => {
	runCmdSync(`git config user.name ${config.name}`)
	runCmdSync(`git config user.email ${config.email}`)
}
