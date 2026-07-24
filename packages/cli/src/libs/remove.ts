import inquirer from 'inquirer';
import pc from 'picocolors'
import { removeConfig, createEmptyJsonWhenNeeds } from '@lexmin0412/gcm-api'

interface RemoveOptions {
	alias?: string
	json?: boolean
}

export const remove = async(options: RemoveOptions = {}) => {
	createEmptyJsonWhenNeeds()

	let alias = options.alias

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

	try {
		removeConfig(alias!)
		if (options.json) {
			console.log(JSON.stringify({ success: true, alias }))
		} else {
			console.log(pc.green(`配置 ${alias} 删除成功`))
		}
	} catch (error: any) {
		const msg = error.message || '删除失败'
		if (options.json) {
			console.log(JSON.stringify({ success: false, error: msg }))
		} else {
			console.error(pc.red(msg))
		}
		process.exit(1)
	}
}
