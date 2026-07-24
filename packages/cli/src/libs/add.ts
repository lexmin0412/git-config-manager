import inquirer from 'inquirer';
import pc from 'picocolors'
import { addConfig, createEmptyJsonWhenNeeds, getAllUserConfigs, UserConfig } from '@lexmin0412/gcm-api'
import { DEFAULT_ORIGINS } from '../constants';

const flatOrigins = DEFAULT_ORIGINS.map((item)=>item.origin)

interface AddOptions {
	alias?: string
	name?: string
	email?: string
	origin?: string
	json?: boolean
}

export const add = async(options: AddOptions = {}) => {
	createEmptyJsonWhenNeeds()

	let alias = options.alias
	let name = options.name
	let email = options.email
	let origin = options.origin

	// 如果缺少必要参数，使用交互式输入
	if (!alias) {
		const result = await inquirer.prompt([
			{
				type: 'input',
				name: 'alias',
				message: '请输入别名',
			}
		])
		alias = result.alias
	}

	const userList = getAllUserConfigs()
	const aliasExisted = userList.some((user)=>user.alias === alias)
	if (aliasExisted) {
		const msg = `别名 ${alias} 已存在`
		if (options.json) {
			console.log(JSON.stringify({ success: false, error: msg }))
		} else {
			console.error(pc.red(msg))
		}
		process.exit(1)
	}

	if (!name || !email || !origin) {
		const answers = await inquirer.prompt([
			{
				type: 'input',
				name: 'name',
				message: '请输入用户名',
				default: name,
			},
			{
				type: 'input',
				name: 'email',
				message: '请输入邮箱',
				default: email,
			},
			{
				type: 'list',
				name: 'origin',
				message: '请选择适用于当前配置的 git 远程域名',
				choices: [
					...flatOrigins,
					'custom'
				],
				default: origin,
			}
		])
		name = answers.name
		email = answers.email
		origin = answers.origin

		if (origin === 'custom') {
			const { customOrigin } = await inquirer.prompt([
				{
					type: 'input',
					name: 'customOrigin',
					message: '请输入需要应用当前配置的 git 远程域名(如 github.com )',
				}
			])
			origin = customOrigin
		}
	}

	const newConfig: UserConfig = {
		alias: alias!,
		name: name!,
		email: email!,
		origin: origin!,
	}

	addConfig(newConfig)

	if (options.json) {
		console.log(JSON.stringify({ success: true, config: newConfig }))
	} else {
		console.log(pc.green(`添加成功: ${alias}`))
	}
}
