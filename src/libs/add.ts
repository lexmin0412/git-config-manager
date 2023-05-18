import inquirer from 'inquirer';
import pc from 'picocolors'
import { addConfig, createEmptyJsonWhenNeeds } from '../utils/index'
import { DEFAULT_ORIGINS } from '../constants';
import { getAllUserConfigs } from './../utils/index';

const flatOrigins = DEFAULT_ORIGINS.map((item)=>item.origin)

export const add = async() => {

	const { alias } = await inquirer
		.prompt([
			{
				type: 'input',
				name: 'alias',
				message: '请输入别名',
			}])

	const userList = getAllUserConfigs()
	const alisExisted = userList.some((user)=>user.alias === alias)
	if (alisExisted) {
		console.error(pc.red('别名已存在，请调整后重试哦～'))
		process.exit(1)
	}

	inquirer
		.prompt([
			{
				type: 'input',
				name: 'name',
				message: '请输入用户名',
			},
			{
				type: 'input',
				name: 'email',
				message: '请输入邮箱',
			},
			{
				type: 'list',
				name: 'origin',
				message: '请选择适用于当前配置的 git 远程域名',
				choices: [
					...flatOrigins,
					'custom'
				]
			}
		])
		.then(async(answers) => {

			let origin = answers.origin

			if (answers.origin === 'custom') {
				const { customOrigin } = await inquirer.prompt([
					{
						type: 'input',
						name: 'customOrigin',
						message: '请输入需要应用当前配置的 git 远程域名(如 github.com )',
					}
				])
				origin = customOrigin
			}

			createEmptyJsonWhenNeeds()
			addConfig({
				alias: alias,
				name: answers.name,
				email: answers.email,
				origin: origin
			})
		})
		.catch((error) => {
			if (error.isTtyError) {
				// 当前运行环境不支持
				console.error(`Prompt couldn't be rendered in the current environment, please check your platform`)
			} else {
				console.error('error', error)
				process.exit(1)
			}
		});
}
